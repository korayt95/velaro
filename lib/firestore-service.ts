import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import type { CarFormData } from "./generate-listing"

export type ListingRecord = {
  id?: string
  userId: string
  carData: CarFormData
  generatedListing: string
  createdAt: Timestamp
}

export async function saveGeneratedListing(
  userId: string,
  carData: CarFormData,
  generatedListing: string,
): Promise<string> {
  try {
    const listingRef = await addDoc(collection(db, "listings"), {
      userId,
      carData,
      generatedListing,
      createdAt: Timestamp.now(),
    })

    return listingRef.id
  } catch (error) {
    console.error("Error saving listing:", error)
    throw new Error("Failed to save listing")
  }
}

export async function getUserListings(userId: string): Promise<ListingRecord[]> {
  try {
    const listingsQuery = query(collection(db, "listings"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(listingsQuery)
    const listings: ListingRecord[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData
      listings.push({
        id: doc.id,
        userId: data.userId,
        carData: data.carData,
        generatedListing: data.generatedListing,
        createdAt: data.createdAt,
      })
    })

    return listings
  } catch (error) {
    console.error("Error fetching user listings:", error)
    throw new Error("Failed to fetch listings")
  }
}

export async function deleteUserListing(listingId: string): Promise<void> {
  try {
    const listingRef = doc(db, "listings", listingId)
    await deleteDoc(listingRef)
  } catch (error) {
    console.error("Error deleting listing:", error)
    throw new Error("Failed to delete listing")
  }
}

export async function getUserGenerationCount(userId: string): Promise<number> {
  try {
    const listingsQuery = query(
      collection(db, "listings"),
      where("userId", "==", userId),
      limit(1000), // Adjust as needed
    )

    const querySnapshot = await getDocs(listingsQuery)
    return querySnapshot.size
  } catch (error) {
    console.error("Error counting user generations:", error)
    throw new Error("Failed to count generations")
  }
}

