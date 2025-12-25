import bcrypt from "bcryptjs";

// salt + hash password
export async function saltAndHashPassword(password: string): Promise<string> {
  
  // 몇번 해싱을 적용할건지
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  
  // 해싱 적용
  const hash = await bcrypt.hash(password, salt);
  
  return hash;
}


// DB에 저장된 비밀번호와 입력된 비밀번호 일치여부 확인 
export function comparePassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}
