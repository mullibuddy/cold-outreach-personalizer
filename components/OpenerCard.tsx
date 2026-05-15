'use client'

import { CopyButton } from './CopyButton'

interface Opener {
  angle: string
  hook: string
  explanation: string
  followUp: string
  bestFor: string
}

interface OpenerCardProps {
  opener: Opener
  accentColor: 'slate' | 'sage' | 'amber'
}

const accentColors = {
  slate: 'border-l-slate-500',
  sage: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
}

const angleBadgeColors = {
  trigger: 'bg-slate-100 text-slate-700 border-slate-300',
  pain: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  curiosity: 'bg-amber-100 text-amber-700 border-amber-300',
}

const channelBadgeColors = {
  cold_email: 'bg-blue-50 text-blue-700 border-blue-200',
  linkedin_dm: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cold_call: 'bg-amber-50 text-amber-700 border-amber-200',
}

const channelLabels: Record<string, string> = {
  cold_email: 'Cold Email',
  linkedin_dm: 'LinkedIn DM',
  cold_call: 'Cold Call',
}

export function OpenerCard({ opener, accentColor }: OpenerCardProps) {
  const copyText = `${opener.hook}\n\n${opener.followUp}`

  const angleKey = opener.angle.toLowerCase() as keyof typeof angleBadgeColors
  const angleBadgeColor = angleBadgeColors[angleKey] || angleBadgeColors.trigger

  const channelKey = opener.bestFor.toLowerCase().replace(/ /g, '_')
  const channelBadgeColor = channelBadgeColors[channelKey as keyof typeof channelBadgeColors] || channelBadgeColors.cold_email

  return (
    <div className={`bg-white rounded-lg border border-gray-200 border-l-4 ${accentColors[accentColor]} p-6 space-y-4 shadow-sm`}>
      {/* Header: Angle Badge */}
      <div className="flex items-center justify-between">
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${angleBadgeColor} capitalize`}>
          {opener.angle}
        </span>
      </div>

      {/* Hook */}
      <div>
        <p className="text-base text-gray-900 leading-relaxed">{opener.hook}</p>
      </div>

      {/* Why This Works */}
      <div className="bg-gray-50 rounded-md p-4">
        <p className="text-sm text-gray-600 font-light">{opener.explanation}</p>
      </div>

      {/* Follow-Up Line */}
      <div>
        <p className="text-sm text-gray-700 italic">{opener.followUp}</p>
      </div>

      {/* Footer: Best For + Copy Button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Best for:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded border ${channelBadgeColor}`}>
            {channelLabels[opener.bestFor] || opener.bestFor}
          </span>
        </div>
        <CopyButton text={copyText} />
      </div>
    </div>
  )
}
