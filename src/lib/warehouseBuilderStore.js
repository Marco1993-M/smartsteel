import { create } from "zustand"

export const DEFAULT_WAREHOUSE_BUILDER_STATE = {
  productType: "LSF Warehouse",
  width: 10,
  length: 20,
  wallHeight: 3,
  roofType: "dual_pitch",
  roofPitch: 15,
  cladding: "IBR",
  scope: "supply_only",
  installationInterest: false,
  enclosureType: "roof_only",
  rollerDoorCount: 0,
  garageDoorOpeningType: "single",
  pedestrianDoorCount: 0,
  steelFinish: "Galv",
  gableMode: "sheeted_gable",
  deliveryRequired: false,
  deliveryDistance: 0,
  province: "Gauteng",
  location: "",
  intendedUse: "",
  projectStage: "",
  targetTimeline: "Not sure yet",
  notes: "",
}

export const useWarehouseBuilderStore = create((set) => ({
  ...DEFAULT_WAREHOUSE_BUILDER_STATE,
  updateField: (field, value) => set({ [field]: value }),
  patchFields: (values) => set(values),
  reset: () => set(DEFAULT_WAREHOUSE_BUILDER_STATE),
}))
