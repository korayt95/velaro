"use client"

// Funcții pentru gestionarea API key-ului Plate Recognizer

// Salvează API key-ul în localStorage și cookie
export function saveApiKey(apiKey: string): void {
  try {
    // Salvăm în localStorage pentru acces client-side
    localStorage.setItem("plateRecognizerApiKey", apiKey)

    // Salvăm și în cookie pentru acces server-side (middleware)
    document.cookie = `plateRecognizerApiKey=${apiKey}; path=/; max-age=2592000; SameSite=Strict` // 30 zile
  } catch (error) {
    console.error("Error saving API key:", error)
  }
}

// Obține API key-ul din localStorage
export function getApiKey(): string | null {
  try {
    return localStorage.getItem("plateRecognizerApiKey")
  } catch (error) {
    console.error("Error getting API key:", error)
    return null
  }
}

// Verifică dacă API key-ul este configurat
export function isApiKeyConfigured(): boolean {
  return !!getApiKey()
}

// Șterge API key-ul
export function clearApiKey(): void {
  try {
    localStorage.removeItem("plateRecognizerApiKey")
    document.cookie = "plateRecognizerApiKey=; path=/; max-age=0"
  } catch (error) {
    console.error("Error clearing API key:", error)
  }
}

