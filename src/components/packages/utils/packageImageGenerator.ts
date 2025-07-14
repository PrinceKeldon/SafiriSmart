import { OperatorPackage } from '@/types/operator';

export const generatePackageImage = async (
  pkg: OperatorPackage,
  operatorProfile?: any
): Promise<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Set canvas size
  canvas.width = 800;
  canvas.height = 1000;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add border
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Company name (if available)
  let y = 40;
  if (operatorProfile?.company_name || operatorProfile?.company) {
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(operatorProfile.company_name || operatorProfile.company, 30, y);
    y += 40;
  }

  // Header
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 32px Arial';
  ctx.fillText(pkg.package_name, 30, y);
  y += 40;

  // Budget tier badge
  const budgetColors = {
    budget: '#059669',
    'mid-range': '#2563eb',
    luxury: '#7c3aed'
  };
  ctx.fillStyle = budgetColors[pkg.budget_tier as keyof typeof budgetColors] || '#6b7280';
  ctx.fillRect(30, y, 120, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.fillText(pkg.budget_tier || 'budget', 40, y + 20);
  y += 50;

  // Description
  ctx.fillStyle = '#374151';
  ctx.font = '18px Arial';
  const description = pkg.description || '';
  const words = description.split(' ');
  let line = '';
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > 740 && n > 0) {
      ctx.fillText(line, 30, y);
      line = words[n] + ' ';
      y += 25;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 30, y);

  // Details section
  y += 50;
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Package Details', 30, y);

  y += 40;
  ctx.fillStyle = '#374151';
  ctx.font = '18px Arial';
  ctx.fillText(`Duration: ${pkg.min_duration}-${pkg.max_duration} days`, 30, y);
  
  y += 30;
  ctx.fillText(`Group Size: ${pkg.min_group_size}-${pkg.max_group_size} people`, 30, y);
  
  y += 30;
  ctx.fillText(`Cost: $${pkg.estimated_cost_per_person_per_day}/person/day`, 30, y);

  // Locations
  if (pkg.included_locations && pkg.included_locations.length > 0) {
    y += 50;
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Included Locations:', 30, y);
    
    y += 30;
    ctx.fillStyle = '#374151';
    ctx.font = '16px Arial';
    pkg.included_locations.forEach((location) => {
      ctx.fillText(`• ${location}`, 50, y);
      y += 25;
    });
  }

  // Activities
  if (pkg.included_activities && pkg.included_activities.length > 0) {
    y += 30;
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Included Activities:', 30, y);
    
    y += 30;
    ctx.fillStyle = '#374151';
    ctx.font = '16px Arial';
    pkg.included_activities.forEach((activity) => {
      ctx.fillText(`• ${activity}`, 50, y);
      y += 25;
    });
  }

  // Footer
  y += 50;
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.fillText(`Created: ${new Date(pkg.created_at).toLocaleDateString()}`, 30, y);

  return canvas;
};

export const downloadPackageImage = async (
  pkg: OperatorPackage,
  operatorProfile?: any
) => {
  try {
    const canvas = await generatePackageImage(pkg, operatorProfile);
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pkg.package_name.replace(/\s+/g, '_')}_package.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    throw new Error('Failed to generate package image');
  }
};