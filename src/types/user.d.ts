/* 用户信息 */
export type User = {
  /* token令牌 */
  token: string
  /* 用户ID */
  id: string
  /* 用户名称 */
  account: string
  /* 手机号 */
  mobile: string
  /* 头像 */
  avatar: string
}

// 短信验证码类型，登录|注册|修改手机号|忘记密码|绑定手机号
export type CodeType = 'login' | 'register' | 'changeMobile' | 'forgetPassword' | 'bindMobile'

// Omit从类型对象中排出指定的属性类型，得到剩余的,另有：Pick 从类型对象中取出指定的属性类型，得到取出的
// &表示为交叉类型，新的类型将拥有所有交叉类型中的属性和方法
type OmitUser = Omit<User, 'token'>
export type UserInfo = OmitUser & {
  likeNumber: number
  collectionNumber: number
  score: number
  couponNumber: number
  orderInfo: {
    paidNumber: number
    receivedNumber: number
    shippedNumber: number
    finishedNumber: number
  }
}

// 家庭档案-患者信息
export type Patient = {
  // 患者ID
  id?: string
  // 患者名称
  name: string
  // 身份证号
  idCard: string
  // 0不默认  1默认
  defaultFlag: 0 | 1
  // 0 女  1 男
  gender: 0 | 1
  // 性别文字
  genderValue?: string
  // 年龄
  age?: number
}

// 家庭档案-患者信息列表
export type PatientList = Patient[]
