export function setItem (name:string, value:any) {
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  return window.localStorage.setItem(name, value)
}

export function getItem (name:string):any|Token {
  let value = window.localStorage.getItem(name)
  try {
    value = JSON.parse(value as string)
    return value
  } catch {
    return value
  }
}

export function removeItem (name:string) {
  return window.localStorage.removeItem(name)
}
