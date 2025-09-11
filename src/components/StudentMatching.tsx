import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, X, MapPin, BookOpen, Star, Users } from "lucide-react";
import { useState } from "react";

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
}

const StudentMatching = ({ onBack }: StudentMatchingProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Student[]>([]);
  
  const currentStudent = mockStudents[currentIndex];

  const handleLike = () => {
    if (currentStudent) {
      setMatches([...matches, currentStudent]);
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
              <Card className="bg-gradient-card border-border shadow-gaming overflow-hidden transform transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 text-4xl">
                    {currentStudent.avatar}
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
                  className="w-16 h-16 rounded-full border-destructive/20 hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="gaming"
                  size="lg"
                  onClick={handleLike}
                  className="w-16 h-16 rounded-full shadow-glow hover:shadow-gaming transition-all duration-300"
                >
                  <Heart className="w-6 h-6" />
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

        {/* Matches Preview */}
        {matches.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-center mb-6">Your Matches</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {matches.map((match, index) => (
                <Card key={match.id} className="bg-gradient-card border-gaming-primary/20 animate-slide-in" style={{animationDelay: `${index * 100}ms`}}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{match.avatar}</div>
                    <div className="text-sm font-medium">{match.name}</div>
                    <div className="text-xs text-muted-foreground">{match.major}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMatching;