import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, UserPlus, Crown, Zap, Heart } from "lucide-react";
import { useState } from "react";
import StudentMatching from "./StudentMatching";
import QuizLobby from "./QuizLobby";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<"dashboard" | "matching" | "lobby">("dashboard");

  if (activeSection === "matching") {
    return <StudentMatching onBack={() => setActiveSection("dashboard")} />;
  }

  if (activeSection === "lobby") {
    return <QuizLobby onBack={() => setActiveSection("dashboard")} />;
  }

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-6 animate-glow-pulse">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            StudyMatch Arena
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with study partners and challenge them in epic quiz battles. Level up your learning game!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-card border-border hover:shadow-gaming transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-gaming-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-gaming-accent">12</div>
              <div className="text-sm text-muted-foreground">Study Matches</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border hover:shadow-gaming transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-gaming-warning mx-auto mb-3" />
              <div className="text-2xl font-bold text-gaming-warning">847</div>
              <div className="text-sm text-muted-foreground">Quiz Points</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border hover:shadow-gaming transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Crown className="w-8 h-8 text-gaming-success mx-auto mb-3" />
              <div className="text-2xl font-bold text-gaming-success">5</div>
              <div className="text-sm text-muted-foreground">Victories</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-gradient-card border-gaming-primary/20 hover:border-gaming-primary/40 transition-all duration-300 hover:shadow-gaming group cursor-pointer"
                onClick={() => setActiveSection("matching")}>
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 rounded-full bg-gaming-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gaming-primary/30 transition-colors">
                <Users className="w-6 h-6 text-gaming-primary" />
              </div>
              <CardTitle className="text-xl mb-2">Find Study Partners</CardTitle>
              <CardDescription>
                Connect with students who share your interests and study goals
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                variant="gaming" 
                size="lg" 
                className="w-full"
                onClick={() => setActiveSection("matching")}
              >
                Start Matching
                <Heart className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-gaming-accent/20 hover:border-gaming-accent/40 transition-all duration-300 hover:shadow-gaming group cursor-pointer"
                onClick={() => setActiveSection("lobby")}>
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 rounded-full bg-gaming-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gaming-accent/30 transition-colors">
                <Gamepad2 className="w-6 h-6 text-gaming-accent" />
              </div>
              <CardTitle className="text-xl mb-2">Quiz Battles</CardTitle>
              <CardDescription>
                Create or join quiz lobbies for 2v2 or 4-player competitions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                variant="accent" 
                size="lg" 
                className="w-full"
                onClick={() => setActiveSection("lobby")}
              >
                Enter Arena
                <Gamepad2 className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: "match", user: "Alex Chen", subject: "Computer Science", time: "2 hours ago" },
              { type: "victory", opponent: "Sarah K.", points: 150, time: "1 day ago" },
              { type: "match", user: "Miguel R.", subject: "Mathematics", time: "3 days ago" },
            ].map((activity, index) => (
              <Card key={index} className="bg-gradient-card border-border animate-slide-in" style={{animationDelay: `${index * 100}ms`}}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    {activity.type === "match" ? (
                      <Users className="w-5 h-5 text-gaming-primary" />
                    ) : (
                      <Crown className="w-5 h-5 text-gaming-warning" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {activity.type === "match" 
                          ? `Matched with ${activity.user}` 
                          : `Victory vs ${activity.opponent}`
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.type === "match" ? activity.subject : `+${activity.points} points`} • {activity.time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;