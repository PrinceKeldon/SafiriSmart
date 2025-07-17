
import { TravelPreferences } from '@/components/preferences/WizardTypes';

interface ItineraryOptions {
  activities: string[];
  accommodations: string[];
  locations: string[];
  culturalExperiences: string[];
  uniqueExperiences: string[];
}

class EnhancedAiService {
  private baseUrl: string;
  private kenyanExperiences: ItineraryOptions;

  constructor() {
    this.baseUrl = import.meta.env.VITE_AI_CORE_SERVICE_URL || 'http://localhost:8000';
    
    this.kenyanExperiences = {
      activities: [
        'Traditional game drives',
        'Walking safaris with Maasai guides',
        'Night game drives',
        'Hot air balloon safaris',
        'Photography workshops',
        'Bird watching expeditions',
        'Community conservancy visits',
        'Traditional craft workshops',
        'Sundowner experiences',
        'Bush breakfasts',
        'Cultural village immersions',
        'Conservation project visits',
        'Horseback safaris',
        'Camel trekking',
        'Mountain hiking',
        'Fishing expeditions',
        'Stargazing sessions',
        'Traditional dance performances'
      ],
      accommodations: [
        'Luxury tented camps',
        'Eco-lodges',
        'Community-owned conservancies',
        'Boutique safari lodges',
        'Mobile camping experiences',
        'Tree house lodges',
        'Cultural homestays',
        'Riverside camps',
        'Mountain lodges',
        'Beach extensions'
      ],
      locations: [
        'Masai Mara National Reserve',
        'Amboseli National Park',
        'Tsavo East & West',
        'Samburu National Reserve',
        'Lake Nakuru National Park',
        'Aberdare National Park',
        'Meru National Park',
        'Lake Naivasha',
        'Hell\'s Gate National Park',
        'Ol Pejeta Conservancy',
        'Laikipia Plateau',
        'Lewa Wildlife Conservancy',
        'Maasai Mara conservancies',
        'Mount Kenya region'
      ],
      culturalExperiences: [
        'Maasai village visits',
        'Samburu cultural encounters',
        'Traditional cooking classes',
        'Beadwork workshops',
        'Storytelling sessions with elders',
        'Traditional medicine walks',
        'Community school visits',
        'Local market experiences',
        'Traditional music sessions',
        'Pottery making workshops'
      ],
      uniqueExperiences: [
        'Rhino tracking at Ol Pejeta',
        'Elephant orphanage visits',
        'Giraffe feeding experiences',
        'Cheetah tracking programs',
        'Lion monitoring expeditions',
        'Vulture restaurant visits',
        'Hippo pool observations',
        'Crocodile watching',
        'Salt lick observations',
        'Migration river crossings'
      ]
    };
  }

  private generateCreativePrompt(preferences: TravelPreferences): string {
    const diversityElements = this.selectDiverseElements(preferences);
    
    return `
    You are Mwangi, an imaginative and experienced Kenyan travel curator with 20+ years of creating extraordinary safari adventures. Your mission is to surprise and delight travelers with unique journeys that go beyond the ordinary. You think outside the box and craft experiences that reveal Kenya's hidden gems and authentic soul.

    CREATIVE MANDATE:
    - THINK CREATIVELY and AVOID standard tourist routes unless explicitly requested
    - Generate at least THREE distinct activity options for each day
    - Ensure VARIETY in experience types (mix game drives with cultural visits, walking safaris, relaxation, adventure)
    - Include unexpected discoveries and off-the-beaten-path experiences
    - Weave storytelling and local legends into daily activities

    ANTI-PROMPTS (STRICTLY AVOID):
    - DO NOT use generic, overused phrases like "world-class safari experience"
    - AVOID suggesting only the most obvious attractions
    - DO NOT create repetitive daily schedules
    - REJECT cookie-cutter itineraries that could apply to any destination

    USER PREFERENCES:
    Duration: ${preferences.duration} days
    Budget: ${preferences.budgetRange}
    Group Size: ${preferences.groupSize} travelers
    Interests: ${preferences.interests.join(', ')}
    Travel Pace: ${preferences.travelPace}
    Languages: ${preferences.languages.join(', ')}

    DIVERSITY INJECTION (incorporate these unique elements):
    Suggested Activities: ${diversityElements.activities.join(', ')}
    Cultural Experiences: ${diversityElements.cultural.join(', ')}
    Unique Encounters: ${diversityElements.unique.join(', ')}
    Alternative Locations: ${diversityElements.locations.join(', ')}

    CREATIVITY GUIDELINES:
    1. Start each day with an unexpected twist or unique angle
    2. Include at least one "only in Kenya" experience daily
    3. Incorporate local time concepts (e.g., "Kenyan time" for relaxed schedules)
    4. Suggest seasonal or weather-dependent alternatives
    5. Include interactions with local communities and conservation efforts
    6. Create narrative threads that connect experiences across days
    7. Offer choice points where travelers can customize their experience

    STRUCTURE REQUIREMENTS:
    - Provide a compelling tour name that captures the unique essence
    - Write an engaging summary that highlights what makes this itinerary special
    - For each day, include:
      * A thematic focus or story element
      * Primary activity with 2-3 alternative options
      * Cultural or community interaction
      * Unique accommodation suggestion with character
      * Local meal recommendation or food experience
      * Evening activity or relaxation option
      * Flexible timing options
    
    PERSONALIZATION FACTORS:
    ${this.generatePersonalizationPrompts(preferences)}

    Create an itinerary that feels like a personal journey crafted by a local friend who knows all the secret spots and stories. Make every day feel like a small adventure with multiple pathways for discovery.
    `;
  }

  private selectDiverseElements(preferences: TravelPreferences) {
    const selectedActivities = this.weightedSelection(this.kenyanExperiences.activities, 5, preferences);
    const selectedCultural = this.weightedSelection(this.kenyanExperiences.culturalExperiences, 3, preferences);
    const selectedUnique = this.weightedSelection(this.kenyanExperiences.uniqueExperiences, 3, preferences);
    const selectedLocations = this.weightedSelection(this.kenyanExperiences.locations, 4, preferences);

    return {
      activities: selectedActivities,
      cultural: selectedCultural,
      unique: selectedUnique,
      locations: selectedLocations
    };
  }

  private weightedSelection(options: string[], count: number, preferences: TravelPreferences): string[] {
    const weightedOptions = options.map(option => ({
      option,
      weight: this.calculateWeight(option, preferences)
    }));

    weightedOptions.sort(() => Math.random() - 0.5);
    
    const selected: string[] = [];
    const usedIndices = new Set<number>();

    while (selected.length < count && selected.length < options.length) {
      const randomIndex = Math.floor(Math.random() * weightedOptions.length);
      
      if (!usedIndices.has(randomIndex)) {
        selected.push(weightedOptions[randomIndex].option);
        usedIndices.add(randomIndex);
      }
    }

    return selected;
  }

  private calculateWeight(option: string, preferences: TravelPreferences): number {
    let weight = 1;

    preferences.interests.forEach(interest => {
      if (option.toLowerCase().includes(interest.toLowerCase().replace('-', ' '))) {
        weight += 2;
      }
    });

    if (preferences.budgetRange === 'luxury' && 
        (option.includes('luxury') || option.includes('exclusive') || option.includes('private'))) {
      weight += 1.5;
    }

    if (preferences.budgetRange === 'budget' && 
        (option.includes('community') || option.includes('local') || option.includes('walking'))) {
      weight += 1.5;
    }

    if (preferences.groupSize <= 2 && option.includes('intimate')) {
      weight += 1;
    }

    if (preferences.groupSize > 4 && option.includes('group')) {
      weight += 1;
    }

    if (preferences.travelPace === 'relaxed' && 
        (option.includes('relaxation') || option.includes('sundowner') || option.includes('spa'))) {
      weight += 1;
    }

    if (preferences.travelPace === 'active' && 
        (option.includes('walking') || option.includes('hiking') || option.includes('adventure'))) {
      weight += 1;
    }

    return weight;
  }

  private generatePersonalizationPrompts(preferences: TravelPreferences): string {
    let prompts = '';

    if (preferences.interests.includes('wildlife-safari')) {
      prompts += `
      - Focus on rare and endangered species encounters
      - Include conservation success stories
      - Suggest optimal wildlife viewing times and techniques`;
    }

    if (preferences.interests.includes('cultural-experiences')) {
      prompts += `
      - Prioritize authentic community interactions
      - Include traditional ceremonies or rituals (if available)
      - Suggest learning opportunities (crafts, cooking, language)`;
    }

    if (preferences.interests.includes('photography')) {
      prompts += `
      - Suggest best lighting conditions and photo opportunities
      - Include specialized photography hides or positions
      - Recommend equipment and techniques for wildlife photography`;
    }

    if (preferences.interests.includes('bird-watching')) {
      prompts += `
      - Highlight endemic and rare bird species
      - Include seasonal migration patterns
      - Suggest early morning birding opportunities`;
    }

    if (preferences.budgetRange === 'luxury') {
      prompts += `
      - Include exclusive experiences not available to general public
      - Suggest private conservancies and premium accommodations
      - Add personalized services and unique amenities`;
    }

    if (preferences.budgetRange === 'budget') {
      prompts += `
      - Focus on community-based tourism options
      - Include camping and authentic local experiences
      - Suggest cost-effective alternatives that don't compromise experience quality`;
    }

    if (preferences.travelPace === 'relaxed') {
      prompts += `
      - Allow ample time at each location
      - Include spa treatments and wellness activities
      - Suggest flexible scheduling with optional activities`;
    }

    if (preferences.travelPace === 'active') {
      prompts += `
      - Pack activities efficiently while maintaining quality
      - Include physical activities and adventure elements
      - Suggest early starts and full-day experiences`;
    }

    return prompts;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers && typeof options.headers === 'object' && options.headers !== null) {
      const incomingHeaders = options.headers as Record<string, string>;
      Object.assign(headers, incomingHeaders);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async generateEnhancedItinerary(preferences: TravelPreferences): Promise<any> {
    console.log('🎨 Generating enhanced creative itinerary with:', {
      duration: preferences.duration,
      budget: preferences.budgetRange,
      interests: preferences.interests,
      pace: preferences.travelPace
    });

    const iterations = await this.generateMultipleIterations(preferences, 3);
    
    const selectedItinerary = this.selectMostDiverse(iterations);
    
    console.log('✨ Enhanced itinerary generated with creative elements');
    return selectedItinerary;
  }

  private async generateMultipleIterations(preferences: TravelPreferences, count: number): Promise<any[]> {
    const iterations: any[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const enhancedPrompt = this.generateCreativePrompt(preferences);
        
        // Create a properly typed request body object
        const requestBody: Record<string, any> = {
          duration: preferences.duration,
          budgetRange: preferences.budgetRange,
          interests: preferences.interests,
          groupSize: preferences.groupSize,
          travelPace: preferences.travelPace,
          languages: preferences.languages,
          enhanced_prompt: enhancedPrompt,
          creativity_seed: Math.random(),
          iteration_number: i + 1
        };
        
        // Add optional properties if they exist
        if (preferences.schedule) {
          requestBody.schedule = preferences.schedule;
        }
        if (preferences.travel) {
          requestBody.travel = preferences.travel;
        }
        if (preferences.dietary) {
          requestBody.dietary = preferences.dietary;
        }
        
        const iteration = await this.makeRequest('/generate_itinerary', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });
        
        if (iteration) {
          iterations.push({
            ...iteration,
            diversity_score: this.calculateDiversityScore(iteration),
            creativity_elements: this.extractCreativityElements(iteration)
          });
        }
      } catch (error) {
        console.warn(`⚠️ Iteration ${i + 1} failed, continuing with others:`, error);
      }
    }
    
    return iterations.length > 0 ? iterations : [await this.generateFallbackItinerary(preferences)];
  }

  private selectMostDiverse(iterations: any[]): any {
    if (iterations.length === 0) {
      throw new Error('No valid iterations generated');
    }
    
    iterations.sort((a, b) => (b.diversity_score || 0) - (a.diversity_score || 0));
    
    console.log('🎯 Selected most diverse iteration with score:', iterations[0].diversity_score);
    return iterations[0];
  }

  private calculateDiversityScore(itinerary: any): number {
    let score = 0;
    
    if (!itinerary.itinerary_details) return score;
    
    const activities = new Set<string>();
    const locations = new Set<string>();
    const accommodationTypes = new Set<string>();
    
    itinerary.itinerary_details.forEach((day: any) => {
      if (day.activities) {
        day.activities.forEach((activity: string) => activities.add(activity.toLowerCase()));
      }
      
      if (day.location) {
        locations.add(day.location.toLowerCase());
      }
      
      if (day.accommodation_suggestion) {
        accommodationTypes.add(day.accommodation_suggestion.toLowerCase());
      }
    });
    
    score += activities.size * 2;
    score += locations.size * 1.5;
    score += accommodationTypes.size;
    
    if (itinerary.tour_name && !itinerary.tour_name.includes('Safari Adventure')) {
      score += 5;
    }
    
    return score;
  }

  private extractCreativityElements(itinerary: any): string[] {
    const elements: string[] = [];
    
    if (itinerary.tour_name && !itinerary.tour_name.includes('Safari')) {
      elements.push('Creative tour name');
    }
    
    if (itinerary.itinerary_details) {
      itinerary.itinerary_details.forEach((day: any) => {
        if (day.theme && !day.theme.includes('Wildlife')) {
          elements.push(`Unique theme: ${day.theme}`);
        }
      });
    }
    
    return elements;
  }

  private async generateFallbackItinerary(preferences: TravelPreferences): Promise<any> {
    console.log('🔄 Generating fallback itinerary with basic creativity enhancements');
    
    // Create a proper default TravelPreferences object
    const defaultPreferences: TravelPreferences = {
      duration: 7,
      budgetRange: 'mid-range',
      interests: ['wildlife-safari'],
      groupSize: 2,
      travelPace: 'relaxed',
      languages: ['English']
    };
    
    // Safely merge preferences - ensure preferences is a valid object before processing
    const safePreferences: TravelPreferences = preferences && typeof preferences === 'object' && !Array.isArray(preferences) 
      ? { ...defaultPreferences, ...preferences }
      : defaultPreferences;
    
    return {
      tour_name: `${safePreferences.duration}-Day Hidden Gems of Kenya Safari`,
      summary: `Discover Kenya's best-kept secrets on this carefully crafted ${safePreferences.duration}-day adventure, designed for ${safePreferences.groupSize} travelers seeking authentic experiences beyond the ordinary tourist trail.`,
      itinerary_details: this.generateCreativeFallbackDays(safePreferences),
      inclusions_suggestions: this.getEnhancedInclusions(safePreferences),
      exclusions_suggestions: this.getStandardExclusions(),
      important_notes: this.getCreativeNotes(safePreferences),
      diversity_score: 15,
      creativity_elements: ['Unique experience focus', 'Local community integration']
    };
  }

  private generateCreativeFallbackDays(preferences: TravelPreferences) {
    const diverseElements = this.selectDiverseElements(preferences);
    
    return Array.from({ length: preferences.duration }, (_, index) => ({
      day_number: index + 1,
      theme: index === 0 ? 'Arrival & First Discoveries' : 
             index === 1 ? 'Wildlife Encounters & Cultural Connections' :
             index === 2 ? 'Hidden Gems & Local Secrets' :
             index === preferences.duration - 1 ? 'Final Adventures & Departure' :
             `Authentic Kenya Experience Day ${index + 1}`,
      location: diverseElements.locations[index % diverseElements.locations.length] || 'Masai Mara Region',
      activities: [
        diverseElements.activities[index % diverseElements.activities.length],
        diverseElements.cultural[index % diverseElements.cultural.length] || 'Cultural interaction',
        diverseElements.unique[index % diverseElements.unique.length] || 'Wildlife viewing'
      ],
      accommodation_suggestion: `${preferences.budgetRange === 'luxury' ? 'Boutique' : 'Authentic'} ${diverseElements.locations[index % diverseElements.locations.length]} Lodge`,
      meals: ['Breakfast with local flavors', 'Traditional lunch experience', 'Dinner under African stars'],
      unique_experiences: diverseElements.unique.slice(0, 2),
      flexibility_options: [
        'Alternative activity based on weather',
        'Optional extended experience',
        'Cultural immersion upgrade available'
      ]
    }));
  }

  private getEnhancedInclusions(preferences: TravelPreferences): string[] {
    return [
      'All national park and conservancy fees',
      'Expert local guide fluent in ' + preferences.languages.join(' and '),
      'Authentic cultural experiences and community visits',
      'Unique wildlife encounters and conservation insights',
      'All accommodation as specified with local character',
      'Traditional and international meal experiences',
      '4WD safari vehicle with photography amenities',
      'Storytelling sessions and local legend sharing',
      'Flexibility for weather or wildlife migration changes'
    ];
  }

  private getStandardExclusions(): string[] {
    return [
      'International flights and travel insurance',
      'Kenya visa fees and vaccinations',
      'Personal shopping and souvenirs',
      'Alcoholic beverages (unless specified)',
      'Tips for guides and lodge staff',
      'Optional activity upgrades',
      'Personal equipment and cameras'
    ];
  }

  private getCreativeNotes(preferences: TravelPreferences): string[] {
    return [
      'This itinerary is designed to showcase Kenya\'s authentic character beyond typical tourist experiences',
      'Weather and wildlife movements may create opportunities for spontaneous discoveries',
      'Cultural experiences are arranged with respect for local customs and traditions',
      'Photography opportunities are enhanced with local knowledge of best timing and locations',
      preferences.budgetRange === 'luxury' ? 
        'Exclusive experiences and private conservancy access included for intimate wildlife encounters' :
        'Community-based tourism elements support local conservation and development efforts',
      'Flexible scheduling allows for "Kenyan time" approach to unhurried, quality experiences'
    ].filter(Boolean);
  }
}

export const enhancedAiService = new EnhancedAiService();
