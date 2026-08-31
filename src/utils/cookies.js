const isProduction = import.meta.env.PROD;

const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const secureFlag = isProduction ? ";secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;samesite=strict${secureFlag}`;
};

const getCookie = (name) => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(valueParts.join("="));
  }
  return null;
};

const deleteCookie = (name) => {
  const secureFlag = isProduction ? ";secure" : "";
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;samesite=strict${secureFlag}`;
};

export { setCookie, getCookie, deleteCookie };
