"use client"
import { LoginForm } from "@/components/login/login-form"
import { GalleryVerticalEnd } from "lucide-react"

export default function Page() {
    return (
        <div className="min-h-svh flex flex-col items-center justify-center gap-4 p-6">
            <div className="flex items-center gap-2 font-medium mb-8">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <GalleryVerticalEnd className="size-4" />
                </div>
                <span className="text-lg">Escalas</span>
            </div>
            <div className="w-full max-w-xs">
                <LoginForm />
            </div>
        </div>
    )
}
