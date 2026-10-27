"""Regression tests for update validation without creating or changing a database."""
import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

# Importing the API normally creates a database connection.
with patch("models.VehicleManager"):
    import main


class UpdateValidationTests(unittest.TestCase):
    def setUp(self):
        self.manager = MagicMock()
        self.manager.update_consumable.return_value = True
        self.manager.get_vehicle_by_id.return_value = {"id": 1}
        self.manager.update_vehicle.return_value = True
        self.patch_manager = patch.object(main, "manager", self.manager)
        self.patch_manager.start()
        self.addCleanup(self.patch_manager.stop)
        self.client = TestClient(main.app)

    def test_invalid_component_updates_do_not_reach_storage(self):
        invalid = [
            {"parca_adi": ""},
            {"maliyet": -1},
            {"omur_km": 0},
            {"omur_km": -1},
            {"degisim_km": -1},
        ]
        for payload in invalid:
            with self.subTest(payload=payload):
                response = self.client.put("/consumables/1", json=payload)
                self.assertEqual(response.status_code, 422)
        self.manager.update_consumable.assert_not_called()

    def test_partial_component_update_preserves_omitted_fields(self):
        response = self.client.put("/consumables/1", json={"omur_km": 1})
        self.assertEqual(response.status_code, 200)
        self.manager.update_consumable.assert_called_once_with(1, {"omur_km": 1})

    def test_zero_cost_and_zero_replacement_km_are_valid(self):
        payload = {"parca_adi": "Lastik", "maliyet": 0, "omur_km": 1, "degisim_km": 0}
        response = self.client.put("/consumables/1", json=payload)
        self.assertEqual(response.status_code, 200)
        self.manager.update_consumable.assert_called_once_with(1, payload)

    def test_null_optional_component_fields_are_not_written(self):
        response = self.client.put("/consumables/1", json={"maliyet": None, "omur_km": 100})
        self.assertEqual(response.status_code, 200)
        self.manager.update_consumable.assert_called_once_with(1, {"omur_km": 100})

    def test_invalid_vehicle_updates_do_not_reach_storage(self):
        valid = {"marka": "Toyota", "model": "Corolla", "yil": 2006, "guncel_km": 0}
        for change in ({"marka": ""}, {"model": ""}, {"guncel_km": -1}):
            with self.subTest(change=change):
                response = self.client.put("/vehicles/1", json={**valid, **change})
                self.assertEqual(response.status_code, 422)
        self.manager.update_vehicle.assert_not_called()
        self.manager.get_vehicle_by_id.assert_not_called()

    def test_vehicle_update_accepts_zero_kilometres(self):
        payload = {"marka": "Toyota", "model": "Corolla", "yil": 2006, "guncel_km": 0}
        response = self.client.put("/vehicles/1", json=payload)
        self.assertEqual(response.status_code, 200)
        self.manager.update_vehicle.assert_called_once()
        vehicle_id, saved = self.manager.update_vehicle.call_args.args
        self.assertEqual(vehicle_id, 1)
        self.assertEqual(saved["guncel_km"], 0)


if __name__ == "__main__":
    unittest.main()
