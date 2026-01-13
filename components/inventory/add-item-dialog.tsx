"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Sparkles, Loader2, Camera, X, HelpCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ItemFormData } from "@/lib/types"
import { researchProduct } from "@/app/actions/product-research"
import {
  identifyProductFromPhotoV2,
  type StrategicIdentificationResult,
} from "@/app/actions/identify-from-photo-v2"
import type { ClarificationQuestion } from "@/lib/prompts/photo-identification"
import { logIdentificationOutcome } from "@/lib/langfuse/scoring"
import { useToast } from "@/hooks/use-toast"

const CATEGORIES = ["Furniture", "Electronics", "Kitchenware", "Clothing", "Books", "Decor", "Tools", "Other"]
const LOCATIONS = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Garage", "Storage", "Office", "Other"]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_IMAGE_DIMENSION = 100 // 100px minimum
const MAX_IMAGE_DIMENSION = 4096 // 4096px maximum
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"]
const OPTIMAL_AI_DIMENSION = 1024 // Optimal size for AI analysis
const COMPRESSION_QUALITY = 0.85 // JPEG compression quality

interface AddItemDialogProps {
  onItemAdded: () => void
}

/**
 * Renders a clarification question with the appropriate input type.
 */
interface ClarificationQuestionInputProps {
  question: ClarificationQuestion
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function ClarificationQuestionInput({
  question,
  value,
  onChange,
  disabled = false,
}: ClarificationQuestionInputProps) {
  const inputId = `question-${question.question.slice(0, 20).replace(/\s+/g, "-")}`

  switch (question.inputType) {
    case "select":
      return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger id={inputId} className="bg-white dark:bg-gray-900">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__other__">Other</SelectItem>
          </SelectContent>
        </Select>
      )

    case "number":
      return (
        <Input
          id={inputId}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || "Enter a number..."}
          disabled={disabled}
          className="bg-white dark:bg-gray-900"
        />
      )

    case "text":
    default:
      return (
        <Input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || "Enter your answer..."}
          disabled={disabled}
          className="bg-white dark:bg-gray-900"
        />
      )
  }
}

async function getImageOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer)
      if (view.getUint16(0, false) !== 0xffd8) {
        resolve(1) // Not a JPEG, no orientation data
        return
      }
      const length = view.byteLength
      let offset = 2
      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) {
          resolve(1)
          return
        }
        const marker = view.getUint16(offset, false)
        offset += 2
        if (marker === 0xffe1) {
          const little = view.getUint16((offset += 8), false) === 0x4949
          offset += view.getUint32(offset + 4, little)
          const tags = view.getUint16(offset, little)
          offset += 2
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) === 0x0112) {
              resolve(view.getUint16(offset + i * 12 + 8, little))
              return
            }
          }
        } else if ((marker & 0xff00) !== 0xff00) {
          break
        } else {
          offset += view.getUint16(offset, false)
        }
      }
      resolve(1)
    }
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024))
  })
}

function applyOrientation(ctx: CanvasRenderingContext2D, orientation: number, width: number, height: number) {
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0)
      break
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height)
      break
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height)
      break
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0)
      break
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0)
      break
    case 7:
      ctx.transform(0, -1, -1, 0, height, width)
      break
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width)
      break
    default:
      break
  }
}

async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      if (width > OPTIMAL_AI_DIMENSION || height > OPTIMAL_AI_DIMENSION) {
        const aspectRatio = width / height
        if (width > height) {
          width = OPTIMAL_AI_DIMENSION
          height = Math.round(OPTIMAL_AI_DIMENSION / aspectRatio)
        } else {
          height = OPTIMAL_AI_DIMENSION
          width = Math.round(OPTIMAL_AI_DIMENSION * aspectRatio)
        }
      }

      const orientation = await getImageOrientation(file)

      const canvas = document.createElement("canvas")
      if (orientation >= 5 && orientation <= 8) {
        canvas.width = height
        canvas.height = width
      } else {
        canvas.width = width
        canvas.height = height
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      applyOrientation(ctx, orientation, width, height)

      ctx.drawImage(img, 0, 0, width, height)

      const quality = file.size > MAX_IMAGE_SIZE ? COMPRESSION_QUALITY : 0.95
      const base64Image = canvas.toDataURL("image/jpeg", quality)

      console.log(
        "[v0] Image preprocessed:",
        `Original: ${Math.round(file.size / 1024)}KB (${img.width}x${img.height})`,
        `→ Processed: ${Math.round((base64Image.length * 0.75) / 1024)}KB (${width}x${height})`,
      )

      resolve(base64Image)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Could not load image for preprocessing"))
    }

    img.src = objectUrl
  })
}

async function validateImage(file: File): Promise<{ valid: boolean; error?: string }> {
  console.log("[v0] Validating image:", {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString(),
  })

  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: "Image must be smaller than 5MB" }
  }

  if (file.size === 0) {
    return { valid: false, error: "Image file is empty" }
  }

  if (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  ) {
    console.log("[v0] HEIC/HEIF file detected - browser will handle conversion")
    return new Promise((resolve) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)

        if (img.width < MIN_IMAGE_DIMENSION || img.height < MIN_IMAGE_DIMENSION) {
          resolve({
            valid: false,
            error: `Image is too small. Minimum size is ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}px`,
          })
          return
        }

        if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
          resolve({
            valid: false,
            error: `Image is too large. Maximum size is ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}px`,
          })
          return
        }

        console.log("[v0] HEIC/HEIF validation passed:", `${img.width}x${img.height}`)
        resolve({ valid: true })
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        console.error("[v0] HEIC/HEIF loading failed")
        resolve({
          valid: false,
          error: "Could not load HEIC/HEIF image. Try converting to JPEG first or use a different photo.",
        })
      }

      img.src = objectUrl
    })
  }

  const buffer = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  let detectedType: string | null = null

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    detectedType = "image/jpeg"
  } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    detectedType = "image/png"
  } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    detectedType = "image/gif"
  } else if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    detectedType = "image/webp"
  }

  if (!detectedType || !ALLOWED_IMAGE_TYPES.includes(detectedType)) {
    console.error("[v0] Invalid image type detected:", {
      detectedType,
      declaredType: file.type,
      firstBytes: Array.from(bytes.slice(0, 12))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" "),
    })
    return {
      valid: false,
      error: "Invalid image format. Please use JPEG, PNG, GIF, WebP, or HEIC (iPhone photos)",
    }
  }

  console.log("[v0] Image type validated:", detectedType)

  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      if (img.width < MIN_IMAGE_DIMENSION || img.height < MIN_IMAGE_DIMENSION) {
        resolve({
          valid: false,
          error: `Image is too small. Minimum size is ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}px`,
        })
        return
      }

      if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
        resolve({
          valid: false,
          error: `Image is too large. Maximum size is ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}px`,
        })
        return
      }

      console.log("[v0] Image dimensions validated:", `${img.width}x${img.height}`)
      resolve({ valid: true })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      console.error("[v0] Image loading failed")
      resolve({ valid: false, error: "Could not load image. File may be corrupted" })
    }

    img.src = objectUrl
  })
}

export function AddItemDialog({ onItemAdded }: AddItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false)
  const [processingStage, setProcessingStage] = useState<string>("")
  const [clarificationNeeded, setClarificationNeeded] = useState(false)
  const [clarificationPhotos, setClarificationPhotos] = useState<string[]>([])
  // V2: Store full result for multi-round clarification flow
  const [pendingResult, setPendingResult] = useState<StrategicIdentificationResult | null>(null)
  // V2: Track structured answers by question text
  const [structuredAnswers, setStructuredAnswers] = useState<Record<string, string>>({})
  // V2: Track clarification round (max 2)
  const [clarificationRound, setClarificationRound] = useState(0)
  // Langfuse: Track AI suggestion for scoring
  const [aiSuggestion, setAiSuggestion] = useState<{
    name: string;
    traceId?: string;
  } | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<ItemFormData>>({
    name: "",
    description: "",
    category: "",
    location: "",
    quantity: 1,
    weight: null,
    length: null,
    width: null,
    height: null,
    notes: "",
    is_packed: false,
    photo_url: null,
  })

  // Helper to apply estimates from v2 result to form
  const applyEstimates = (result: StrategicIdentificationResult) => {
    setFormData((prev) => ({
      ...prev,
      name: result.estimates.itemType,
      category: result.estimates.category || prev.category,
      weight: result.estimates.weight ?? prev.weight,
      length: result.estimates.dimensions.length ?? prev.length,
      width: result.estimates.dimensions.width ?? prev.width,
      height: result.estimates.dimensions.height ?? prev.height,
      can_disassemble: result.estimates.canDisassemble ?? prev.can_disassemble,
    }))
  }

  // Helper to proceed with product research after identification
  const proceedWithResearch = async (productName: string) => {
    setProcessingStage("Searching web for specifications...")
    setIsResearching(true)

    try {
      const productInfo = await researchProduct(productName)

      setFormData((prev) => ({
        ...prev,
        name: productInfo.name || productName,
        description: productInfo.description || prev.description,
        category: productInfo.category || prev.category,
        weight: productInfo.weight ?? prev.weight,
        length: productInfo.dimensions.length ?? prev.length,
        width: productInfo.dimensions.width ?? prev.width,
        height: productInfo.dimensions.height ?? prev.height,
        can_disassemble: productInfo.canDisassemble ?? prev.can_disassemble,
      }))

      toast({
        title: "Product identified and researched!",
        description: `Found specifications for ${productInfo.name || productName}`,
      })
    } catch (researchError) {
      console.error("Error researching product:", researchError)

      setFormData((prev) => ({
        ...prev,
        name: productName,
      }))

      toast({
        title: "Product identified",
        description: `Found: ${productName}. Could not auto-fill specifications - please enter manually.`,
      })
    } finally {
      setProcessingStage("")
      setIsAnalyzingPhoto(false)
      setIsResearching(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("[v2] Starting image validation for file:", file.name, file.type, file.size)

    setProcessingStage("Validating image...")
    setIsAnalyzingPhoto(true)
    // Reset clarification state for new photo
    setClarificationNeeded(false)
    setPendingResult(null)
    setStructuredAnswers({})
    setClarificationRound(0)
    setClarificationPhotos([])

    const validation = await validateImage(file)
    if (!validation.valid) {
      setIsAnalyzingPhoto(false)
      setProcessingStage("")
      toast({
        title: "Invalid image",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    console.log("[v2] Image validation passed")

    try {
      setProcessingStage("Processing image...")
      const processedImage = await preprocessImage(file)
      setUploadedPhoto(processedImage)

      setProcessingStage("Identifying product with AI...")

      try {
        const result = await identifyProductFromPhotoV2(processedImage)

        console.log("[v2] Identification result:", {
          identified: !!result.identified,
          confidence: result.identified?.confidence,
          questionsCount: result.questions?.length ?? 0,
          strategy: result.strategy.approach,
          traceId: result.traceId,
        })

        // Case 1: High confidence identification - proceed to research
        if (result.identified && result.identified.confidence === "high") {
          // Track AI suggestion for scoring
          setAiSuggestion({
            name: result.identified.fullProductName,
            traceId: result.traceId,
          })
          await proceedWithResearch(result.identified.fullProductName)
          return
        }

        // Case 2: Questions available - show clarification UI
        if (result.questions && result.questions.length > 0) {
          console.log("[v2] AI requesting clarification from user")
          setPendingResult(result)
          setClarificationNeeded(true)
          setClarificationRound(1)
          setProcessingStage("")
          setIsAnalyzingPhoto(false)
          toast({
            title: "Need more information",
            description: "Please answer a few questions to help identify the product.",
          })
          return
        }

        // Case 3: Medium confidence identification - proceed with research
        if (result.identified) {
          // Track AI suggestion for scoring
          setAiSuggestion({
            name: result.identified.fullProductName,
            traceId: result.traceId,
          })
          await proceedWithResearch(result.identified.fullProductName)
          return
        }

        // Case 4: No identification, no questions - use estimates
        console.log("[v2] Using visual estimates directly")
        // Track estimate as AI suggestion for scoring
        setAiSuggestion({
          name: result.estimates.itemType,
          traceId: result.traceId,
        })
        applyEstimates(result)
        setProcessingStage("")
        setIsAnalyzingPhoto(false)
        toast({
          title: "Item analyzed",
          description: "Using visual estimates. You can refine the details below.",
        })
      } catch (error) {
        console.error("Error identifying product:", error)
        setProcessingStage("")
        setIsAnalyzingPhoto(false)

        const errorMessage =
          error instanceof Error && error.message.includes("unclear")
            ? "Image is unclear or contains multiple items. Please enter the product name manually."
            : "Could not identify the product. Please enter the name manually."

        toast({
          title: "Identification needs help",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing photo:", error)
      setIsAnalyzingPhoto(false)
      setProcessingStage("")
      toast({
        title: "Processing failed",
        description: "Could not process the image. Please try again with a different image.",
        variant: "destructive",
      })
    }
  }

  const handleClarificationPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    const file = files?.[0]
    if (!file) return

    console.log("[v0] Uploading clarification photo:", file.name)

    setProcessingStage("Validating additional photo...")

    const validation = await validateImage(file)
    if (!validation.valid) {
      setProcessingStage("")
      toast({
        title: "Invalid image",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    try {
      setProcessingStage("Processing additional photo...")
      const processedImage = await preprocessImage(file)
      setClarificationPhotos((prev) => [...prev, processedImage])
      setProcessingStage("")
      toast({
        title: "Photo added",
        description: "Additional photo uploaded successfully",
      })
    } catch (error) {
      console.error("Error processing clarification photo:", error)
      setProcessingStage("")
      toast({
        title: "Processing failed",
        description: "Could not process the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  // V2: Handle skip clarification - use estimates directly
  const handleSkipClarification = () => {
    if (!pendingResult) return

    console.log("[v2] User skipped clarification, using estimates")
    // Track estimate as AI suggestion for scoring
    setAiSuggestion({
      name: pendingResult.estimates.itemType,
      traceId: pendingResult.traceId,
    })
    applyEstimates(pendingResult)
    setClarificationNeeded(false)
    setPendingResult(null)
    setStructuredAnswers({})
    setClarificationPhotos([])

    toast({
      title: "Using visual estimates",
      description: "You can refine the details below.",
    })
  }

  // V2: Handle clarification submit with structured answers
  const handleClarificationSubmit = async () => {
    if (!uploadedPhoto || !pendingResult) {
      return
    }

    // Check if any answers provided
    const hasAnswers = Object.values(structuredAnswers).some((v) => v.trim() !== "")
    if (!hasAnswers && clarificationPhotos.length === 0) {
      toast({
        title: "Please provide information",
        description: "Answer at least one question or upload additional photos.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzingPhoto(true)
    setProcessingStage("Re-analyzing with your answers...")
    setClarificationNeeded(false)

    try {
      // Build context from photos if any
      let userContext: string | undefined
      if (clarificationPhotos.length > 0) {
        userContext = `User provided ${clarificationPhotos.length} additional photo(s) showing different angles/details.`
      }

      // Call v2 API with structured answers
      const result = await identifyProductFromPhotoV2(
        uploadedPhoto,
        userContext,
        structuredAnswers
      )

      const nextRound = clarificationRound + 1
      setClarificationRound(nextRound)

      console.log("[v2] Re-identification result:", {
        identified: !!result.identified,
        confidence: result.identified?.confidence,
        questionsCount: result.questions?.length ?? 0,
        round: nextRound,
      })

      // Case 1: Got identification - proceed to research
      if (result.identified && result.identified.confidence !== "low") {
        // Track AI suggestion for scoring
        setAiSuggestion({
          name: result.identified.fullProductName,
          traceId: result.traceId,
        })
        await proceedWithResearch(result.identified.fullProductName)
        setStructuredAnswers({})
        setClarificationPhotos([])
        return
      }

      // Case 2: More questions and under round limit - ask again
      if (result.questions && result.questions.length > 0 && nextRound < 2) {
        setPendingResult(result)
        setClarificationNeeded(true)
        setStructuredAnswers({}) // Reset for new questions
        setProcessingStage("")
        setIsAnalyzingPhoto(false)
        toast({
          title: "Need a bit more info",
          description: "One more round of questions to help narrow it down.",
        })
        return
      }

      // Case 3: Max rounds reached or no more questions - use estimates
      console.log("[v2] Max rounds reached or no questions, using estimates")
      // Track estimate as AI suggestion for scoring
      setAiSuggestion({
        name: result.estimates.itemType,
        traceId: result.traceId,
      })
      applyEstimates(result)
      setProcessingStage("")
      setIsAnalyzingPhoto(false)
      setStructuredAnswers({})
      setClarificationPhotos([])
      setPendingResult(null)

      toast({
        title: nextRound >= 2 ? "Max rounds reached" : "Item analyzed",
        description: "Using visual estimates. You can refine the details below.",
      })
    } catch (error) {
      console.error("Error re-identifying product:", error)
      setProcessingStage("")
      setIsAnalyzingPhoto(false)

      // Fall back to estimates on error
      if (pendingResult) {
        applyEstimates(pendingResult)
        setPendingResult(null)
        setStructuredAnswers({})
        setClarificationPhotos([])
      }

      toast({
        title: "Analysis failed",
        description: "Using visual estimates. You can refine the details below.",
        variant: "destructive",
      })
    }
  }

  const clearPhoto = () => {
    setUploadedPhoto(null)
    setPendingResult(null)
    setStructuredAnswers({})
    setClarificationRound(0)
    setAiSuggestion(null)
  }

  const handleAIResearch = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Enter product name",
        description: "Please enter a product name first (e.g., 'IKEA Besta TV Unit')",
        variant: "destructive",
      })
      return
    }

    setIsResearching(true)
    try {
      const productInfo = await researchProduct(formData.name)

      setFormData((prev) => ({
        ...prev,
        name: productInfo.name || prev.name,
        description: productInfo.description || prev.description,
        category: productInfo.category || prev.category,
        weight: productInfo.weight ?? prev.weight,
        length: productInfo.dimensions.length ?? prev.length,
        width: productInfo.dimensions.width ?? prev.width,
        height: productInfo.dimensions.height ?? prev.height,
        can_disassemble: productInfo.canDisassemble ?? prev.can_disassemble,
      }))

      toast({
        title: "Product info found!",
        description: "Fields have been auto-filled with product specifications.",
      })
    } catch (error) {
      console.error("Error researching product:", error)
      toast({
        title: "Research failed",
        description: "Could not find product information. Please enter details manually.",
        variant: "destructive",
      })
    } finally {
      setIsResearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      let photoUrl = formData.photo_url
      if (uploadedPhoto) {
        try {
          // Convert base64 to blob
          const base64Response = await fetch(uploadedPhoto)
          const blob = await base64Response.blob()

          // Create file from blob
          const file = new File([blob], `item-${Date.now()}.jpg`, { type: "image/jpeg" })

          // Upload to Vercel Blob
          const formDataToUpload = new FormData()
          formDataToUpload.append("file", file)

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formDataToUpload,
          })

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload photo")
          }

          const uploadResult = await uploadResponse.json()
          photoUrl = uploadResult.url

          console.log("[v0] Photo uploaded to Vercel Blob:", uploadResult.url)
        } catch (uploadError) {
          console.error("[v0] Error uploading photo to Blob:", uploadError)
          toast({
            title: "Photo upload failed",
            description: "Item will be saved without photo. You can add it later.",
          })
          photoUrl = null
        }
      }

      const { error } = await supabase.from("items").insert({
        ...formData,
        photo_url: photoUrl,
        user_id: user.id,
      })

      if (error) throw error

      // Log identification outcome to Langfuse (fire-and-forget)
      if (aiSuggestion?.traceId) {
        const nameAccepted = formData.name === aiSuggestion.name
        logIdentificationOutcome(
          aiSuggestion.traceId,
          nameAccepted,
          nameAccepted ? undefined : {
            originalName: aiSuggestion.name,
            finalName: formData.name || "",
          }
        ).catch((err) => {
          // Don't let scoring errors affect user flow
          console.error("[Langfuse] Scoring failed:", err)
        })
      }

      setOpen(false)
      setUploadedPhoto(null)
      setAiSuggestion(null)
      setFormData({
        name: "",
        description: "",
        category: "",
        location: "",
        quantity: 1,
        weight: null,
        length: null,
        width: null,
        height: null,
        notes: "",
        is_packed: false,
        photo_url: null,
      })
      onItemAdded()
    } catch (error) {
      console.error("Error adding item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>Add an item to your moving inventory</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {isAnalyzingPhoto && processingStage && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{processingStage}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {processingStage.includes("Validating") && "Checking image format and quality..."}
                    {processingStage.includes("Processing") && "Optimizing image for AI analysis..."}
                    {processingStage.includes("Identifying") && "Using AI vision to identify the product..."}
                    {processingStage.includes("Searching") && "Searching web for specifications..."}
                    {processingStage.includes("Re-analyzing") && "Analyzing with your additional context..."}
                  </p>
                </div>
              </div>
            )}

            {clarificationNeeded && pendingResult?.questions && pendingResult.questions.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    {/* Header with strategy info */}
                    <div>
                      <h4 className="font-medium text-amber-900 dark:text-amber-100">
                        Help us identify this product
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        Strategy: {pendingResult.strategy.approach.replace(/_/g, " ")}
                        {clarificationRound > 1 && ` (Round ${clarificationRound}/2)`}
                      </p>
                    </div>

                    {/* Rich question inputs */}
                    <div className="space-y-4">
                      {pendingResult.questions.map((question, idx) => (
                        <div key={idx} className="space-y-2">
                          <Label className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            {question.question}
                          </Label>
                          <ClarificationQuestionInput
                            question={question}
                            value={structuredAnswers[question.question] || ""}
                            onChange={(value) =>
                              setStructuredAnswers((prev) => ({
                                ...prev,
                                [question.question]: value,
                              }))
                            }
                            disabled={isAnalyzingPhoto}
                          />
                          {question.rationale && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                              {question.rationale}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Estimates preview section */}
                    <div className="bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-700 rounded-md p-3">
                      <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Current Estimates
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Type:</span>{" "}
                          <span className="text-gray-900 dark:text-gray-100">
                            {pendingResult.estimates.itemType}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>{" "}
                          <span className="text-gray-900 dark:text-gray-100">
                            {pendingResult.estimates.category}
                          </span>
                        </div>
                        {(pendingResult.estimates.dimensions.length ||
                          pendingResult.estimates.dimensions.width ||
                          pendingResult.estimates.dimensions.height) && (
                          <div className="col-span-2">
                            <span className="text-gray-500 dark:text-gray-400">Dimensions:</span>{" "}
                            <span className="text-gray-900 dark:text-gray-100">
                              ~{pendingResult.estimates.dimensions.length || "?"}″ ×{" "}
                              {pendingResult.estimates.dimensions.width || "?"}″ ×{" "}
                              {pendingResult.estimates.dimensions.height || "?"}″
                            </span>
                          </div>
                        )}
                        {pendingResult.estimates.weight && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Weight:</span>{" "}
                            <span className="text-gray-900 dark:text-gray-100">
                              ~{pendingResult.estimates.weight} lbs
                            </span>
                          </div>
                        )}
                      </div>
                      {pendingResult.features.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Features: {pendingResult.features.slice(0, 3).join(", ")}
                        </div>
                      )}
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        These will be used if we can't identify the exact product.
                      </p>
                    </div>

                    {/* Additional photos section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("clarification-photo-input")?.click()}
                          disabled={isAnalyzingPhoto}
                          className="border-amber-300 dark:border-amber-700"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Add Photo
                        </Button>
                        <Input
                          id="clarification-photo-input"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleClarificationPhotoUpload}
                          className="hidden"
                        />
                        {clarificationPhotos.length > 0 && (
                          <span className="text-sm text-amber-700 dark:text-amber-400">
                            {clarificationPhotos.length} photo{clarificationPhotos.length > 1 ? "s" : ""} added
                          </span>
                        )}
                      </div>

                      {clarificationPhotos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {clarificationPhotos.map((photo, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={photo || "/placeholder.svg"}
                                alt={`Additional view ${idx + 1}`}
                                className="w-full h-20 object-cover rounded border border-amber-200 dark:border-amber-700"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setClarificationPhotos((prev) => prev.filter((_, i) => i !== idx))
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSkipClarification}
                        disabled={isAnalyzingPhoto}
                        className="flex-1 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      >
                        Skip & Use Estimates
                      </Button>
                      <Button
                        type="button"
                        onClick={handleClarificationSubmit}
                        disabled={isAnalyzingPhoto}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        {isAnalyzingPhoto ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          "Submit Answers"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Product Photo (Optional)</Label>
              {uploadedPhoto ? (
                <div className="relative">
                  <img
                    src={uploadedPhoto || "/placeholder.svg"}
                    alt="Uploaded product"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearPhoto}
                    disabled={isAnalyzingPhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handlePhotoUpload}
                    disabled={isAnalyzingPhoto}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 w-full bg-transparent"
                    onClick={() => document.getElementById("photo-upload")?.click()}
                    disabled={isAnalyzingPhoto}
                  >
                    {isAnalyzingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Upload Photo to Auto-Identify
                      </>
                    )}
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a photo (including iPhone HEIC) and we'll identify the item and help you find specifications
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Item Name *</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., IKEA Besta TV Unit or product URL"
                  className="flex-1"
                  disabled={isAnalyzingPhoto}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAIResearch}
                  disabled={isResearching || !formData.name?.trim() || isAnalyzingPhoto}
                  className="gap-2 shrink-0"
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Auto-fill
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a product name or URL and click Auto-fill to research dimensions and weight
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about the item"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Select
                  required
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="length">Length (in)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.01"
                  value={formData.length || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, length: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="width">Width (in)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData.width || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, width: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="height">Height (in)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData.height || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or instructions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
