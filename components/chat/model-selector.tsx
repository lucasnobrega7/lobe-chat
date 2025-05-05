"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { models } from "@/lib/models"

interface ModelSelectorProps {
  selectedModelId: string
  onModelChange: (modelId: string) => void
}

export function ModelSelector({ selectedModelId, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(selectedModelId)
  const [selectedModel, setSelectedModel] = useState(models.find((model) => model.id === selectedModelId))

  useEffect(() => {
    setValue(selectedModelId)
    setSelectedModel(models.find((model) => model.id === selectedModelId))
  }, [selectedModelId])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedModel?.name || "Select model..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue)
                    setOpen(false)
                    onModelChange(currentValue)
                    setSelectedModel(models.find((m) => m.id === currentValue))
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === model.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
