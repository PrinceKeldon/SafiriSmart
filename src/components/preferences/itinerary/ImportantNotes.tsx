
import React from 'react';
import { InfoIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportantNotesProps {
  notes: string[];
  isSmartGenerated?: boolean;
}

export const ImportantNotes: React.FC<ImportantNotesProps> = ({ notes, isSmartGenerated }) => {
  // Separate smart notes from regular notes
  const smartNotes = notes.filter(note => note.includes('🎯') || note.includes('💡') || note.includes('🤝') || note.includes('📊'));
  const regularNotes = notes.filter(note => !smartNotes.includes(note));

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <InfoIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Important Information</h3>
      </div>

      {/* Smart Generation Planning Notes */}
      {isSmartGenerated && smartNotes.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span>Planning & Booking Guidelines</span>
          </h4>
          <div className="space-y-2">
            {smartNotes.map((note, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 leading-relaxed">
                  {note.replace(/^[🎯💡🤝📊✅💰🌟💚⏰🍽️]\s*/, '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Travel Notes */}
      {regularNotes.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Travel Information</span>
          </h4>
          <div className="space-y-2">
            {regularNotes.map((note, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 leading-relaxed">
                  {note.replace(/^[🌦️📸🌟💚⏰🍽️]\s*/, '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operator Discussion Reminder */}
      <div className="mt-6 p-4 bg-blue-100 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
          <div className="flex-1">
            <h5 className="text-blue-800 font-semibold mb-1">Next Steps</h5>
            <p className="text-blue-700 text-sm">
              Ready to turn this plan into reality? <strong>Contact tour operators</strong> below to discuss 
              availability, customize details, and get accurate pricing for your specific travel dates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
