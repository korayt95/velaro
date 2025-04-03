"use server"

export type CarFormData = {
  make: string
  model: string
  year: string
  mileage: string
  fuel: string
  transmission: string
  traction?: string
  color?: string
  damaged?: string
  price: string
  condition: string
  additionalInfo: string
  tone?: string
}

export async function generateCarListing(carData: CarFormData): Promise<string> {
  try {
    // Folosim API-ul nostru pentru a genera anunțul
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-listing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(carData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate car listing")
    }

    const data = await response.json()
    return data.listing

    // Alternativ, putem folosi direct AI SDK dacă preferăm
    // Păstrăm acest cod comentat ca backup în caz că API-ul nu funcționează
    /*
    const tone = carData.tone || "profesional"

    const toneDescriptions = {
      profesional: "Folosește un ton profesional și de încredere. Prezintă informațiile într-un mod clar și concis.",
      relaxat: "Folosește un ton relaxat și prietenos. Fii conversațional și abordabil.",
      tehnic: "Folosește un ton tehnic și detaliat. Concentrează-te pe specificațiile tehnice și detaliile importante.",
      persuasiv: "Folosește un ton persuasiv și convingător. Evidențiază beneficiile și avantajele mașinii.",
    }

    const selectedTone = toneDescriptions[tone] || toneDescriptions.profesional

    const prompt = `
      Creează un anunț profesional pentru vânzarea unei mașini în România cu următoarele detalii:
      
      Marca: ${carData.make}
      Model: ${carData.model}
      An fabricație: ${carData.year}
      Kilometraj: ${carData.mileage} km
      Combustibil: ${carData.fuel}
      Transmisie: ${carData.transmission}
      ${carData.traction ? `Tracțiune: ${carData.traction}` : ""}
      ${carData.color ? `Culoare: ${carData.color}` : ""}
      ${carData.damaged ? `Avariată: ${carData.damaged}` : ""}
      Preț: ${carData.price} EUR
      Stare: ${carData.condition}
      Informații suplimentare: ${carData.additionalInfo}
      
      Anunțul trebuie să fie în limba română, să aibă un titlu atractiv, să evidențieze punctele forte ale mașinii, 
      și să fie structurat cu paragrafe și să includă toate informațiile importante pentru un potențial cumpărător.
      
      Folosește termeni specifici pieței auto din România, cum ar fi:
      - "carte service" pentru istoricul de service
      - "înmatriculat în România" sau "neînmatriculat" pentru statutul de înmatriculare
      - "fiscal pe loc" pentru transferul fiscal
      - "ITP valabil" pentru inspecția tehnică periodică
      - "fără evenimente în trafic" pentru mașini care nu au fost implicate în accidente
      
      Structurează anunțul astfel:
      1. Un titlu atractiv care include marca, modelul și anul
      2. Un paragraf introductiv care prezintă pe scurt mașina
      3. Detalii tehnice și dotări
      4. Starea mașinii și istoricul
      5. Informații despre preț și disponibilitate
      
      Formatează anunțul cu HTML de bază (paragrafe <p>, titluri <h2>, <h3>, liste <ul><li>, etc.) pentru a fi ușor de citit.
      Începe cu un titlu <h2> atractiv care include marca, modelul și anul.
      
      Ton și stil: ${selectedTone}
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      system: `Ești un expert în vânzarea mașinilor în România. Creezi anunțuri profesionale, atractive și detaliate care ajută proprietarii să-și vândă mașinile rapid și la un preț bun.

    Folosești un ton ${tone} și de încredere. Cunoști foarte bine piața auto din România și termenii specifici folosiți în anunțurile auto românești.
    
    Evită exagerările nejustificate și afirmațiile false. Concentrează-te pe evidențierea punctelor forte reale ale mașinii bazate pe informațiile furnizate.
    
    Folosește un limbaj clar, direct și persuasiv, specific anunțurilor auto din România.`,
    })

    return text
    */
  } catch (error) {
    console.error("Error generating car listing:", error)
    throw new Error("Failed to generate car listing")
  }
}

