import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Star, MapPin, MessageCircle, Video, BookOpen, Users } from "lucide-react";
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
  lastSeen?: string;
  isOnline?: boolean;
}

interface MatchedFriendsProps {
  onBack: () => void;
  matches: Student[];
}

const MatchedFriends = ({ onBack, matches }: MatchedFriendsProps) => {
  const [selectedMatch, setSelectedMatch] = useState<Student | null>(null);

  return (
    <div className="pt-20 pb-12 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matching
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Your Study Squad ✨
            </h1>
            <p className="text-muted-foreground">
              {matches.length} amazing study partner{matches.length !== 1 ? 's' : ''} ready to learn together!
            </p>
          </div>
          
          <div className="flex items-center space-x-2 bg-gaming-primary/10 px-4 py-2 rounded-full">
            <Users className="w-5 h-5 text-gaming-primary" />
            <span className="text-sm font-bold text-gaming-primary">{matches.length}</span>
          </div>
        </div>

        {matches.length === 0 ? (
          <Card className="bg-gradient-card text-center p-12 max-w-md mx-auto">
            <CardContent>
              <Heart className="w-16 h-16 text-gaming-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-semibold mb-2">No matches yet!</h3>
              <p className="text-muted-foreground mb-6">
                Start swiping to find your perfect study partners
              </p>
              <Button variant="gaming" onClick={onBack}>
                Find Study Partners
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <Card 
                key={match.id}
                className="bg-gradient-card border-gaming-primary/30 hover:border-gaming-primary/60 transform hover:scale-105 transition-all duration-500 cursor-pointer group shadow-gaming hover:shadow-glow animate-fade-in"
                style={{animationDelay: `${index * 100}ms`}}
                onClick={() => setSelectedMatch(match)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="relative w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform duration-300 shadow-glow">
                    {match.avatar}
                    {match.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gaming-success rounded-full border-2 border-background flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-xl mb-1 group-hover:text-gaming-primary transition-colors duration-300">
                    {match.name}, {match.age}
                  </CardTitle>
                  
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="w-4 h-4 text-gaming-warning fill-current" />
                    <span className="text-sm font-medium">{match.rating}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {match.major} • {match.university}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {match.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {match.studyLevel} Level
                  </div>

                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                    {match.bio}
                  </p>

                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
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
                          +{match.interests.length - 2}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="gaming" 
                        size="sm" 
                        className="flex-1 group-hover:shadow-glow transition-all duration-300"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gaming-secondary/10 border-gaming-secondary/30 hover:bg-gaming-secondary/20"
                      >
                        <Video className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {matches.length > 0 && (
          <div className="mt-12 text-center">
            <Card className="bg-gradient-card border-gaming-primary/20 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Ready to study together?</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="gaming" className="shadow-glow">
                    <Users className="w-4 h-4 mr-2" />
                    Create Study Group
                  </Button>
                  <Button variant="outline" className="bg-gaming-secondary/10 border-gaming-secondary/30">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchedFriends;