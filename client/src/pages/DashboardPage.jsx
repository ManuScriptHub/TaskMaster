import { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useProjectsStore } from '../stores/projectsStore';
import { useTasksStore } from '../stores/tasksStore';
import { AuthContext } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ProjectList } from '../components/projects/ProjectList';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjectsStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTasksStore();
  
  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchTasks();
    }
  }, [fetchProjects, fetchTasks, user]);
  
  // Filter projects by the current user
  const userProjects = user ? projects.filter(project => project.user_id === user.id) : [];
  
  // Filter tasks by the current user's projects
  const userProjectIds = userProjects.map(project => project.id);
  const userTasks = user ? tasks.filter(task => userProjectIds.includes(task.project_id)) : [];
  
  // Associate tasks with their respective projects
  const projectsWithTasks = userProjects.map(project => {
    const projectTasks = userTasks.filter(task => task.project_id === project.id);
    return { ...project, tasks: projectTasks };
  });
  
  // Show up to 6 projects on the dashboard instead of just 3
  const recentProjects = projectsWithTasks.slice(0, 6);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link to="/projects">Create Project</Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Projects</CardTitle>
            <CardDescription>Your personal projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userProjects.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Tasks</CardTitle>
            <CardDescription>Across your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Completed Tasks</CardTitle>
            <CardDescription>Your completed tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {userTasks.filter(task => task.is_completed).length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Your Projects</h2>
          <Button variant="outline" asChild>
            <Link to="/projects">View All Projects</Link>
          </Button>
        </div>
        
        {projectsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading your projects...</p>
          </div>
        ) : (
          <>
            {userProjects.length > 6 && (
              <p className="text-muted-foreground mb-4">
                Showing 6 of {userProjects.length} projects. View all projects for the complete list.
              </p>
            )}
            <ProjectList 
              projects={recentProjects} 
              onTogglePin={(projectId, isPinned) => {
                const { updateProject } = useProjectsStore.getState();
                const project = projects.find(p => p.id === projectId);
                if (project) {
                  updateProject(projectId, { ...project, is_pinned: !isPinned });
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;