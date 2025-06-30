
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ConfigLink() {
  return (
    <Link to="/config">
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Environment Config
      </Button>
    </Link>
  );
}
