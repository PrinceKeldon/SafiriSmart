
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { b2cApiService } from '@/services/B2CApiService';
import { supabase } from '@/integrations/supabase/client';

export const OperatorSelectionDebugger: React.FC = () => {
  const [debugResults, setDebugResults] = useState<any[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);

  const addResult = (step: string, success: boolean, data: any, error?: any) => {
    setDebugResults(prev => [...prev, {
      step,
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const testPublicOperatorsEndpoint = async () => {
    console.log('🔍 Testing GET /api/operators/public endpoint...');
    try {
      const operators = await b2cApiService.getPublicOperators();
      addResult('GET /api/operators/public', true, {
        operatorCount: operators.length,
        operators: operators.map(op => ({
          id: op.id,
          company_name: op.company_name,
          packageCount: op.top_packages?.length || 0
        }))
      });
      console.log('✅ Public operators fetch successful:', operators);
      return operators;
    } catch (error) {
      console.error('❌ Public operators fetch failed:', error);
      addResult('GET /api/operators/public', false, null, error);
      return null;
    }
  };

  const testLeadCreation = async (selectedOperatorIds: string[]) => {
    console.log('🔍 Testing POST /api/leads endpoint...');
    const testLeadData = {
      traveler: {
        name: 'Debug Test User',
        email: 'debug@test.com',
        phone: '+1234567890',
        country: 'Kenya',
        message: 'This is a debug test inquiry'
      },
      preferences: {
        duration: 7,
        budgetRange: 'mid-range',
        interests: ['wildlife-safari', 'photography'],
        groupSize: 2,
        travelPace: 'moderate',
        languages: ['English']
      },
      schedule: {
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
        flexible: true
      },
      travel: {
        portOfEntry: 'Nairobi',
        airportPickup: true
      },
      dietary: {
        mealWishes: 'No special requirements'
      },
      itinerary: {
        title: 'Debug Test Safari',
        overview: 'A test safari for debugging purposes',
        duration: 7,
        estimatedCost: { amount: 2000, currency: 'USD' }
      },
      selectedOperatorIds
    };

    try {
      const result = await b2cApiService.createLeadWithSelectedOperators(testLeadData);
      addResult('POST /api/leads', true, result);
      console.log('✅ Lead creation successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Lead creation failed:', error);
      addResult('POST /api/leads', false, null, error);
      return null;
    }
  };

  const checkDatabaseState = async (leadId?: string) => {
    console.log('🔍 Checking database state...');
    try {
      // Check leads table
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (leadsError) throw leadsError;

      // Check lead_visibility table
      const { data: visibility, error: visibilityError } = await supabase
        .from('lead_visibility')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (visibilityError) throw visibilityError;

      addResult('Database State Check', true, {
        recentLeads: leads?.length || 0,
        leadVisibilityEntries: visibility?.length || 0,
        latestLead: leads?.[0] || null,
        latestVisibility: visibility?.slice(0, 3) || []
      });

      console.log('✅ Database state check successful');
      console.log('Recent leads:', leads);
      console.log('Lead visibility entries:', visibility);
      
      return { leads, visibility };
    } catch (error) {
      console.error('❌ Database state check failed:', error);
      addResult('Database State Check', false, null, error);
      return null;
    }
  };

  const runFullDebugSequence = async () => {
    setIsDebugging(true);
    setDebugResults([]);

    try {
      // Step 1: Test public operators endpoint
      const operators = await testPublicOperatorsEndpoint();
      if (!operators || operators.length === 0) {
        addResult('Debug Sequence', false, null, 'No operators available for testing');
        return;
      }

      // Step 2: Test lead creation with first two operators
      const selectedOperatorIds = operators.slice(0, 2).map(op => op.id);
      const leadResult = await testLeadCreation(selectedOperatorIds);
      
      // Step 3: Check database state
      await checkDatabaseState(leadResult?.data?.lead_id);

      addResult('Full Debug Sequence', true, { message: 'Debug sequence completed' });
    } catch (error) {
      console.error('❌ Debug sequence failed:', error);
      addResult('Full Debug Sequence', false, null, error);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Operator Selection Flow Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testPublicOperatorsEndpoint} disabled={isDebugging}>
            Test GET /operators/public
          </Button>
          <Button onClick={() => checkDatabaseState()} disabled={isDebugging}>
            Check Database State
          </Button>
          <Button onClick={runFullDebugSequence} disabled={isDebugging}>
            Run Full Debug Sequence
          </Button>
        </div>

        {debugResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Debug Results:</h3>
            {debugResults.map((result, index) => (
              <Alert key={index} className={result.success ? 'border-green-500' : 'border-red-500'}>
                <AlertDescription>
                  <div className="font-medium">
                    {result.success ? '✅' : '❌'} {result.step}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {result.timestamp}
                  </div>
                  {result.data && (
                    <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                  {result.error && (
                    <pre className="text-xs mt-2 bg-red-100 p-2 rounded overflow-auto max-h-32 text-red-800">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
