import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, X, MapPin, BookOpen, Star, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  age: number;
  major: string;
  university: string;
  location: string;
  interests: string[];
  studyLevel: string;
  rating: number;
  bio: string;
  avatar: string;
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Emma Rodriguez",
    age: 21,
    major: "Computer Science",
    university: "MIT",
    location: "Boston, MA",
    interests: ["Machine Learning", "Web Development", "Data Structures"],
    studyLevel: "Advanced",
    rating: 4.8,
    bio: "Passionate about AI and always looking for study partners for challenging CS concepts!",
    avatar: "👩‍💻"
  },
  {
    id: "2", 
    name: "David Kim",
    age: 22,
    major: "Mathematics",
    university: "Stanford",
    location: "Palo Alto, CA",
    interests: ["Calculus", "Linear Algebra", "Statistics"],
    studyLevel: "Intermediate",
    rating: 4.6,
    bio: "Math enthusiast who loves solving complex problems and teaching others.",
    avatar: "👨‍🎓"
  },
  {
    id: "3",
    name: "Sophia Chen",
    age: 20,
    major: "Biology",
    university: "Harvard",
    location: "Cambridge, MA",
    interests: ["Genetics", "Biochemistry", "Research Methods"],
    studyLevel: "Advanced",
    rating: 4.9,
    bio: "Pre-med student focusing on molecular biology. Let's study together!",
    avatar: "👩‍⚕️"
  }
];

interface StudentMatchingProps {
  onBack: () => void;
  onMatchesUpdate?: (matches: Student[]) => void;
}

const StudentMatching = ({ onBack, onMatchesUpdate }: StudentMatchingProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Student[]>([]);
  
  const currentStudent = mockStudents[currentIndex];

  const handleLike = () => {
    if (currentStudent) {
      const updatedMatches = [...matches, currentStudent];
      setMatches(updatedMatches);
      onMatchesUpdate?.(updatedMatches);
      
      // Show success toast
      toast.success(`✨ It's a match with ${currentStudent.name}!`, {
        description: "You can now connect and start studying together",
        duration: 3000,
      });
    }
    nextStudent();
  };

  const handlePass = () => {
    nextStudent();
  };

  const nextStudent = () => {
    if (currentIndex < mockStudents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back for demo
    }
  };

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Find Study Partners</h1>
            <p className="text-muted-foreground">
              {matches.length} matches found
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gaming-primary" />
            <span className="text-sm font-medium">{matches.length}</span>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {currentStudent ? (
            <div className="relative">
              <Card className="bg-gradient-card border-gaming-primary/20 shadow-gaming overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-glow animate-fade-in">
                <CardHeader className="text-center pb-4">
                  <div className="relative w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 text-4xl hover:scale-110 transition-transform duration-300 shadow-glow">
                    {currentStudent.avatar}
                    <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                  
                  <CardTitle className="text-xl mb-1">
                    {currentStudent.name}, {currentStudent.age}
                  </CardTitle>
                  
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="w-4 h-4 text-gaming-warning fill-current" />
                    <span className="text-sm font-medium">{currentStudent.rating}</span>
                  </div>
                  
                  <CardDescription className="text-sm">
                    {currentStudent.major} • {currentStudent.university}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {currentStudent.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {currentStudent.studyLevel} Level
                  </div>

                  <p className="text-sm text-foreground leading-relaxed">
                    {currentStudent.bio}
                  </p>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Study Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentStudent.interests.map((interest, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="text-xs"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-6 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePass}
                  className="w-18 h-18 rounded-full border-destructive/20 hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:scale-110 shadow-card"
                >
                  <X className="w-7 h-7" />
                </Button>
                
                <Button
                  variant="gaming"
                  size="lg"
                  onClick={handleLike}
                  className="w-20 h-20 rounded-full shadow-glow hover:shadow-gaming transition-all duration-300 hover:scale-110 animate-pulse"
                >
                  <Heart className="w-8 h-8" />
                </Button>
              </div>
            </div>
          ) : (
            <Card className="bg-gradient-card text-center p-12">
              <CardContent>
                <Heart className="w-12 h-12 text-gaming-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No more profiles!</h3>
                <p className="text-muted-foreground mb-4">
                  Check back later for new study partners
                </p>
                <Button variant="gaming" onClick={onBack}>
                  View Matches
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Matches Display */}
        {matches.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-gaming-primary animate-pulse" />
                <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Your Study Matches ✨
                </h2>
                <Sparkles className="w-6 h-6 text-gaming-accent animate-pulse" />
              </div>
              <p className="text-muted-foreground">
                {matches.length} amazing study partner{matches.length !== 1 ? 's' : ''} waiting to connect!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {matches.map((match, index) => (
                <Card 
                  key={match.id} 
                  className="bg-gradient-card border-gaming-primary/30 hover:border-gaming-primary/60 transform hover:scale-105 transition-all duration-500 cursor-pointer group animate-fade-in shadow-gaming hover:shadow-glow"
                  style={{animationDelay: `${index * 150}ms`}}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                          {match.avatar}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gaming-success rounded-full flex items-center justify-center">
                          <Heart className="w-3 h-3 text-white fill-current" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg group-hover:text-gaming-primary transition-colors duration-300">
                          {match.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">{match.major}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-gaming-warning fill-current" />
                          <span className="text-xs font-medium">{match.rating}</span>
                          <span className="text-xs text-muted-foreground">• {match.university}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {match.interests.slice(0, 2).map((interest, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary"
                            className="text-xs bg-gaming-primary/10 text-gaming-primary border-gaming-primary/20"
                          >
                            {interest}
                          </Badge>
                        ))}
                        {match.interests.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{match.interests.length - 2} more
                          </Badge>
                        )}
                      </div>
                      
                      <Button 
                        variant="gaming" 
                        size="sm" 
                        className="w-full group-hover:shadow-glow transition-all duration-300"
                      >
                        Connect & Study Together
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {matches.length >= 3 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="bg-gaming-primary/10 border-gaming-primary/30 hover:bg-gaming-primary/20">
                  View All Matches ({matches.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMatching;