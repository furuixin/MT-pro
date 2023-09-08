// 枚举后面的会自增,选项一默认为0选项二默认就是1，如果选项一等于100
// 后面的就从100开始往上加，枚举也可以定义为字符串，所有选项就都要手动定义了
// 枚举的好处是给不好记的0和1赋予名称，
// if(sex==1)不好理解,if(sex==Gender.boy)好理解
// 枚举类型需要在 ts 文件中，因为枚举会编译成 js 代码,而js本身没有枚举类型
// 问诊类型
export enum ConsultType {
  // 找医生
  Doctor = 1,
  // 快速问诊
  Fast = 2,
  // 开药问诊
  Medication = 3
}

// 问诊类型
export enum IllnessType {
  ordinary,
  three
}

// 问诊时间，以1自增可以省略
export enum IllnessTime {
  // 一周内
  Week = 1,
  // 一月内
  Month,
  // 半年内
  HalfYear,
  // 半年以上
  More
}

// 问诊订单
export enum OrderType {
  // 待支付
  ConsultPay = 1,
  // 待接诊
  ConsultWait = 2,
  // 问诊中
  ConsultChat = 3,
  // 问诊完成
  ConsultComplete = 4,
  // 取消问诊
  ConsultCancel = 5,
  // 药品订单
  // 待支付
  MedicinePay = 10,
  // 待发货
  MedicineSend = 11,
  // 待收货
  MedicineTake = 12,
  // 已完成
  MedicineComplete = 13,
  // 取消订单
  MedicineCancel = 14
}
// 消息类型
export enum MsgType {
  // 文字聊天
  MsgText = 1,
  // 消息聊天
  MsgImage = 4,
  // 患者信息
  CardPat = 21,
  // 处方信息
  CardPre = 22,
  // 未评价信息
  CardEvaForm = 23,
  // 已评价信息
  CardEva = 24,
  // 通用通知
  Notify = 31,
  // 温馨提示
  NotifyTip = 32,
  // 取消提示
  NotifyCancel = 33
}

// 处方状态
export enum PrescriptionStatus {
  // 未付款
  NotPayment = 1,
  // 已付款
  Payment = 2,
  // 已失效
  Invalid = 3
}
