
import { supabase } from '@/integrations/supabase/client';
import { TravelPreferences } from '@/components/preferences/WizardTypes';
import { OperatorPackage } from '@/types/operator';

interface PackageMatch {
  package: OperatorPackage;
  matchScore: number;
  matchReasons: string[];
  operatorName?: string;
}

class PackageMatchingService {
  async getMatchingPackages(preferences: TravelPreferences): Promise<PackageMatch[]> {
    try {
      console.log('🔍 Searching for matching packages with preferences:', preferences);

      // Fetch all active operator packages with operator info
      const { data: packagesData, error } = await supabase
        .from('operator_packages')
        .select(`
          *,
          operators!inner(
            id,
            company_name,
            company,
            is_active
          )
        `)
        .eq('operators.is_active', true);

      if (error) {
        console.error('Error fetching packages:', error);
        return [];
      }

      if (!packagesData || packagesData.length === 0) {
        console.log('No packages found in system');
        return [];
      }

      console.log(`Found ${packagesData.length} packages to analyze`);

      // Score and match packages
      const matches: PackageMatch[] = packagesData
        .map(pkg => this.scorePackageMatch(pkg, preferences))
        .filter(match => match.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5); // Top 5 matches

      console.log(`Found ${matches.length} matching packages`);
      return matches;
    } catch (error) {
      console.error('Error in package matching:', error);
      return [];
    }
  }

  private scorePackageMatch(packageData: any, preferences: TravelPreferences): PackageMatch {
    let score = 0;
    const matchReasons: string[] = [];

    const pkg = packageData as OperatorPackage & {
      operators: { company_name?: string; company?: string }
    };

    // Duration matching (high weight)
    if (preferences.duration >= pkg.min_duration && preferences.duration <= pkg.max_duration) {
      score += 25;
      matchReasons.push(`Perfect duration match (${preferences.duration} days)`);
    } else if (Math.abs(preferences.duration - pkg.min_duration) <= 2) {
      score += 15;
      matchReasons.push(`Close duration match (${pkg.min_duration}-${pkg.max_duration} days available)`);
    }

    // Budget tier matching (high weight)
    if (pkg.budget_tier === preferences.budgetRange) {
      score += 20;
      matchReasons.push(`Matches ${preferences.budgetRange} budget tier`);
    }

    // Group size matching
    if (preferences.groupSize >= pkg.min_group_size && preferences.groupSize <= pkg.max_group_size) {
      score += 15;
      matchReasons.push(`Accommodates group of ${preferences.groupSize}`);
    }

    // Location matching based on interests
    const locations = pkg.included_locations || [];
    const activities = pkg.included_activities || [];

    preferences.interests.forEach(interest => {
      switch (interest) {
        case 'wildlife-safari':
          if (locations.some(loc => 
            loc.toLowerCase().includes('masai mara') || 
            loc.toLowerCase().includes('amboseli') ||
            loc.toLowerCase().includes('tsavo') ||
            loc.toLowerCase().includes('samburu')
          )) {
            score += 10;
            matchReasons.push('Includes top wildlife destinations');
          }
          break;
        case 'cultural':
          if (activities.some(act => 
            act.toLowerCase().includes('cultural') ||
            act.toLowerCase().includes('village') ||
            act.toLowerCase().includes('maasai')
          )) {
            score += 8;
            matchReasons.push('Offers cultural experiences');
          }
          break;
        case 'photography':
          if (activities.some(act => 
            act.toLowerCase().includes('photography') ||
            act.toLowerCase().includes('game drive')
          )) {
            score += 8;
            matchReasons.push('Great for photography');
          }
          break;
        case 'bird-watching':
          if (locations.some(loc => 
            loc.toLowerCase().includes('lake nakuru') ||
            loc.toLowerCase().includes('naivasha')
          )) {
            score += 10;
            matchReasons.push('Excellent birding destinations');
          }
          break;
        case 'beach':
          if (locations.some(loc => 
            loc.toLowerCase().includes('diani') ||
            loc.toLowerCase().includes('watamu') ||
            loc.toLowerCase().includes('malindi')
          )) {
            score += 10;
            matchReasons.push('Includes coastal destinations');
          }
          break;
      }
    });

    // Travel pace consideration
    if (preferences.travelPace === 'relaxed' && pkg.max_duration - pkg.min_duration > 2) {
      score += 5;
      matchReasons.push('Flexible duration for relaxed pace');
    }

    const operatorName = pkg.operators?.company_name || pkg.operators?.company || 'Tour Operator';

    return {
      package: pkg,
      matchScore: score,
      matchReasons,
      operatorName
    };
  }
}

export const packageMatchingService = new PackageMatchingService();
