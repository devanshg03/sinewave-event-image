export type AspectOption = {
  id: string
  label: string
  value: number | undefined
}

export const ASPECT_OPTIONS: AspectOption[] = [
  { id: "free", label: "Free", value: undefined },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "4:5", label: "4:5", value: 4 / 5 },
  { id: "3:4", label: "3:4", value: 3 / 4 },
  { id: "16:9", label: "16:9", value: 16 / 9 },
  { id: "9:16", label: "9:16", value: 9 / 16 },
]
