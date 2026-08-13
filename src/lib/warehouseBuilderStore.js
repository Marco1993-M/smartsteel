import { create } from "zustand"

export const WAREHOUSE_SHEETING_COLORS = [
  { value: "galvanised", label: "Galvanised", hex: "#b9c1c7", finish: "galvanised" },
  { value: "fish-eagle-white", label: "Fish Eagle White", hex: "#f2f1e8" },
  { value: "white-lion", label: "White Lion", hex: "#ffffff" },
  { value: "sandstone-beige", label: "Sandstone Beige", hex: "#c8b99c" },
  { value: "gemsbok-sand", label: "Gemsbok Sand", hex: "#b79b72" },
  { value: "aloe-green", label: "Aloe Green", hex: "#718167" },
  { value: "traffic-green", label: "Traffic Green", hex: "#2f5b3e" },
  { value: "uhmlanga-wave", label: "Uhmlanga Wave", hex: "#287b88" },
  { value: "kingfisher-blue", label: "Kingfisher Blue", hex: "#315f82" },
  { value: "azure-blue", label: "Azure Blue", hex: "#4a79a8" },
  { value: "dove-grey", label: "Dove Grey", hex: "#a7adb1" },
  { value: "charcoal-grey", label: "Charcoal Grey", hex: "#505457" },
  { value: "dark-dolphin", label: "Dark Dolphin", hex: "#30383e" },
  { value: "kalahari-red", label: "Kalahari Red", hex: "#8d4036" },
  { value: "buffalo-brown", label: "Buffalo Brown", hex: "#5c4234" },
]

export const WAREHOUSE_OPENING_FACE_OPTIONS = [
  { value: "front", label: "Front" },
  { value: "rear", label: "Rear" },
  { value: "left", label: "Left side" },
  { value: "right", label: "Right side" },
]

export const DEFAULT_WAREHOUSE_BUILDER_STATE = {
  productType: "LCSS Warehouse",
  width: 8,
  length: 20,
  wallHeight: 3,
  roofType: "dual_pitch",
  roofPitch: 15,
  cladding: "None",
  sheetingProfile: "IBR",
  sheetingFinish: "galvanised",
  scope: "supply_only",
  installationInterest: false,
  enclosureType: "roof_only",
  rollerDoorCount: 0,
  garageDoorOpeningType: "single",
  rollerDoorFace: "front",
  pedestrianDoorCount: 0,
  pedestrianDoorFace: "rear",
  sheetingColor: "galvanised",
  steelFinish: "ZAM",
  gableMode: "structure_only",
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
