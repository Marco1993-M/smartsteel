import { create } from "zustand"

export const DEFAULT_WAREHOUSE_BUILDER_STATE = {
  width: 10,
  length: 20,
  wallHeight: 4,
  roofType: "dual_pitch",
  roofPitch: 15,
  cladding: "IBR",
  scope: "supply_only",
  enclosureType: "fully_enclosed",
  rollerDoorCount: 1,
  garageDoorOpeningType: "single",
  pedestrianDoorCount: 1,
  deliveryRequired: true,
  deliveryDistance: 50,
  province: "Gauteng",
  location: "",
  notes: "",
}

export const useWarehouseBuilderStore = create((set) => ({
  ...DEFAULT_WAREHOUSE_BUILDER_STATE,
  updateField: (field, value) => set({ [field]: value }),
  patchFields: (values) => set(values),
  reset: () => set(DEFAULT_WAREHOUSE_BUILDER_STATE),
}))
