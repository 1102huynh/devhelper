'use client'

import React from 'react'
import { Star, Github } from 'lucide-react'
import { Button } from './ui/button'

type Props = {
  repoUrl?: string
  text?: string
  className?: string
  variant?: 'default' | 'outline' | 'full'
}

export default function GitHubStarButton({
  repoUrl = 'https://github.com/1102huynh/devhelper',
  text = 'Star on GitHub',
  className = '',
  variant = 'outline',
}: Props) {
  if (variant === 'full') {
    return (
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#24292f] dark:bg-[#1a1e22] text-white hover:bg-[#1c2127] dark:hover:bg-[#0d1117] transition-colors duration-200 text-sm font-medium shadow-lg hover:shadow-xl ${className}`}
      >
        <Github className="w-4 h-4" />
        <span>{text}</span>
        <Star className="w-4 h-4" />
      </a>
    )
  }

  return (
    <Button
      variant={variant}
      size="sm"
      className={`w-full group hover:shadow-lg transition-all duration-300 ${className}`}
      asChild
    >
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-500" />
        {text}
        <Star className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-300" />
      </a>
    </Button>
  )
}

