import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, BookOpen, Users, Crown } from 'lucide-react';

interface SubjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectSelect: (subject: string, maxPlayers: 2 | 4) => void;
}

const subjects = [
  'Mathematics',
  'Physics', 
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography', 
  'Economics',
  'Psychology',
  'Engineering',
  'Medical'
];

const SubjectSelectionModal = ({ isOpen, onClose, onSubjectSelect }: SubjectSelectionModalProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<2 | 4 | null>(null);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (selectedSubject && selectedPlayers) {
      onSubjectSelect(selectedSubject, selectedPlayers);
      setSelectedSubject('');
      setSelectedPlayers(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-card border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            Create Study Lobby
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Subject Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary" />
              Step 1: Choose Subject
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject) => (
                <Badge
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "outline"}
                  className={`p-3 text-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedSubject === subject 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'hover:bg-primary/10 hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Step 2: Player Count Selection */}
          {selectedSubject && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Step 2: Choose Lobby Size
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedPlayers === 2 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedPlayers(2)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">2-Player Lobby</h4>
                    <p className="text-sm text-muted-foreground">
                      Perfect for focused 1-on-1 study sessions
                    </p>
                    <Badge variant="secondary" className="mt-2">Recommended</Badge>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedPlayers === 4 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedPlayers(4)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center mx-auto mb-3">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">4-Player Lobby</h4>
                    <p className="text-sm text-muted-foreground">
                      Great for group study and team challenges
                    </p>
                    <Badge variant="outline" className="mt-2">Group Fun</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Create Button */}
          {selectedSubject && selectedPlayers && (
            <div className="animate-fade-in pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Creating lobby for:</p>
                  <p className="font-semibold">
                    {selectedSubject} • {selectedPlayers} Players
                  </p>
                </div>
                <Button 
                  onClick={handleCreate}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg"
                >
                  Create Lobby
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectSelectionModal;