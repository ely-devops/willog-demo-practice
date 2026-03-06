/**
 * 섭씨에서 화씨로 변환
 * °F = (°C × 9/5) + 32
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9) / 5 + 32;
};

/**
 * 화씨에서 섭씨로 변환
 * °C = (°F - 32) × 5/9
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return ((fahrenheit - 32) * 5) / 9;
};

/**
 * 언어에 따라 온도를 포맷팅하여 반환
 * @param celsiusValue - 섭씨 온도 값 (숫자 또는 "25.1°C" 형태 문자열)
 * @param language - 현재 언어 ('ko' | 'en')
 * @param decimals - 소수점 자릿수 (기본값: 1)
 * @returns 포맷팅된 온도 문자열 (예: "77.2°F" 또는 "25.1°C")
 */
export const formatTemperature = (
  celsiusValue: number | string,
  language: string,
  decimals: number = 1
): string => {
  // 문자열에서 숫자 추출 (예: "25.1°C" → 25.1)
  let celsius: number;
  if (typeof celsiusValue === 'string') {
    const match = celsiusValue.match(/-?\d+\.?\d*/);
    if (!match) return celsiusValue; // 숫자를 찾을 수 없으면 원본 반환
    celsius = parseFloat(match[0]);
  } else {
    celsius = celsiusValue;
  }

  if (language === 'en') {
    const fahrenheit = celsiusToFahrenheit(celsius);
    return `${fahrenheit.toFixed(decimals)}°F`;
  }

  return `${celsius.toFixed(decimals)}°C`;
};

/**
 * 온도 범위를 언어에 따라 포맷팅
 * @param minCelsius - 최소 섭씨 온도
 * @param maxCelsius - 최대 섭씨 온도
 * @param language - 현재 언어
 * @returns 포맷팅된 온도 범위 문자열 (예: "35.6–46.4°F" 또는 "2–8°C")
 */
export const formatTemperatureRange = (
  minCelsius: number,
  maxCelsius: number,
  language: string
): string => {
  if (language === 'en') {
    const minF = celsiusToFahrenheit(minCelsius);
    const maxF = celsiusToFahrenheit(maxCelsius);
    return `${minF.toFixed(1)}–${maxF.toFixed(1)}°F`;
  }

  return `${minCelsius}–${maxCelsius}°C`;
};
