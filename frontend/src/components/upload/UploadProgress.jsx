// src/components/upload/UploadProgress.jsx
import { Check } from 'lucide-react'

const STAGES = ['Uploading', 'OCR', 'Classifying', 'Extracting', 'Validating', 'Done']

const STAGE_COUNT = STAGES.length

function UploadProgress({ filename, sizeLabel, currentStageIndex, failed }) {
  const percent = Math.round((currentStageIndex / (STAGE_COUNT - 1)) * 100)

  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-ui text-body text-ink">{filename}</p>
          {sizeLabel && <p className="font-ui text-[12px] text-ink-faint">{sizeLabel}</p>}
        </div>
        {!failed && (
          <span className="font-data text-[12px] text-ink-muted">{percent}%</span>
        )}
      </div>
      <div className="flex items-center">
        {STAGES.map((stage, i) => {
          const isLast = i === STAGES.length - 1
          const isComplete = i < currentStageIndex || (i === currentStageIndex && isLast)
          const isCurrent = i === currentStageIndex && !isComplete

          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors
                    ${failed && isCurrent ? 'bg-status-error text-white' : ''}
                    ${!failed && isComplete ? 'bg-status-complete text-white' : ''}
                    ${!failed && isCurrent ? 'bg-accent text-white animate-pulse' : ''}
                    ${!isComplete && !isCurrent ? 'bg-surface-sunken border border-border text-ink-faint' : ''}
                  `}
                >
                  {isComplete && !failed ? <Check size={12} /> : i + 1}
                </div>
                <span className="font-ui text-[11px] text-ink-faint mt-1 whitespace-nowrap">{stage}</span>
              </div>
              {!isLast && (
                <div className={`h-0.5 flex-1 mx-1 mb-4 ${isComplete ? 'bg-status-complete' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>
      {failed && (
        <p className="font-ui text-[12px] text-status-error mt-2">
          Processing failed — document quality too low to extract fields.
        </p>
      )}
    </div>
  )
}

export default UploadProgress