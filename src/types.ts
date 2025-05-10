/**
 * 签到记录数据结构
 */
export interface Codegang_qd {
  id: number
  userid: string
  username: string
  time: Date
  monthlyRecords: JSON
}

export type UserType = 'newUser'|'already'|'notToday'