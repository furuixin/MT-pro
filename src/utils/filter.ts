import { IllnessTime } from '@/enums'
const timeOptions = [
  { label: '一周内', value: IllnessTime.Week },
  { label: '一月内', value: IllnessTime.Month },
  { label: '半年内', value: IllnessTime.HalfYear },
  { label: '大于半年', value: IllnessTime.More }
]
const flagOptions = [
  { label: '就诊过', value: 0 },
  { label: '没就诊过', value: 1 }
]

export const getIllnessTimeText = (time: IllnessTime) => timeOptions.find((item) => item.value === time)?.label

export const getConsultFlagText = (flag: 0 | 1) => flagOptions.find((item) => item.value === flag)?.label
