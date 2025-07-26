
import { TourOutput } from '../WizardTypes';

export const generateItineraryHTML = (itinerary: TourOutput, userDetails?: any): string => {
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${itinerary.tour_name} - Safari Itinerary</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
        .tour-title { color: #059669; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .summary { font-size: 16px; color: #6b7280; margin-bottom: 20px; }
        .day-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .day-header { background: #f3f4f6; padding: 10px; margin: -20px -20px 15px -20px; border-radius: 8px 8px 0 0; }
        .day-number { color: #059669; font-weight: bold; font-size: 18px; }
        .day-theme { font-size: 16px; font-weight: bold; margin-top: 5px; }
        .location { color: #6b7280; margin-bottom: 15px; }
        .section { margin-bottom: 15px; }
        .section-title { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .section-content { margin-left: 15px; }
        .activities { list-style-type: none; padding: 0; }
        .activities li { padding: 5px 0; border-left: 3px solid #059669; padding-left: 10px; margin-bottom: 5px; }
        .inclusions-exclusions { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
        .notes { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        .metadata { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        @media print { body { margin: 0; padding: 15px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="tour-title">${itinerary.tour_name}</h1>
        <p class="summary">${itinerary.summary}</p>
        <div class="metadata">
          <p><strong>Generated:</strong> ${formatDate(new Date())}</p>
          ${userDetails?.name ? `<p><strong>For:</strong> ${userDetails.name}</p>` : ''}
          ${itinerary.creativity_metadata?.generation_method ? 
            `<p><strong>Generation Method:</strong> ${itinerary.creativity_metadata.generation_method.replace(/_/g, ' ')}</p>` : ''}
        </div>
      </div>

      <div class="itinerary-details">
        ${itinerary.itinerary_details.map(day => `
          <div class="day-card">
            <div class="day-header">
              <div class="day-number">Day ${day.day_number}</div>
              <div class="day-theme">${day.theme}</div>
            </div>
            
            <div class="location"><strong>Location:</strong> ${day.location}</div>
            
            <div class="section">
              <div class="section-title">Activities:</div>
              <ul class="activities">
                ${day.activities.map(activity => `<li>${activity}</li>`).join('')}
              </ul>
            </div>
            
            <div class="section">
              <div class="section-title">Accommodation:</div>
              <div class="section-content">${day.accommodation_suggestion}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Meals:</div>
              <div class="section-content">${day.meals.join(', ')}</div>
            </div>
            
            ${day.unique_experiences ? `
              <div class="section">
                <div class="section-title">Unique Experiences:</div>
                <div class="section-content">${day.unique_experiences.join(', ')}</div>
              </div>
            ` : ''}
            
            ${day.cultural_highlight ? `
              <div class="section">
                <div class="section-title">Cultural Highlight:</div>
                <div class="section-content">${day.cultural_highlight}</div>
              </div>
            ` : ''}
            
            ${day.conservation_story ? `
              <div class="section">
                <div class="section-title">Conservation Story:</div>
                <div class="section-content">${day.conservation_story}</div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="inclusions-exclusions">
        <div>
          <h3>Inclusions</h3>
          <ul>
            ${itinerary.inclusions_suggestions.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h3>Exclusions</h3>
          <ul>
            ${itinerary.exclusions_suggestions.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="notes">
        <h3>Important Notes</h3>
        ${itinerary.important_notes.map(note => `<p>${note}</p>`).join('')}
      </div>

      <div class="footer">
        <p>Generated by SafariGuide AI - SafiriSmart</p>
        <p>This is a planning guide. Please discuss all details with your chosen tour operator.</p>
      </div>
    </body>
    </html>
  `;
};

export const downloadItineraryPDF = (itinerary: TourOutput, userDetails?: any) => {
  const htmlContent = generateItineraryHTML(itinerary, userDetails);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};

export const downloadItineraryHTML = (itinerary: TourOutput, userDetails?: any) => {
  const htmlContent = generateItineraryHTML(itinerary, userDetails);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${itinerary.tour_name.replace(/\s+/g, '_')}_itinerary.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
