// SPEC: SPEC-PAGES > /admin/clients/[id] — Client detail with tabs
// DEP-MAP: Client Management > UI > client detail
import { notFound } from "next/navigation";
import { getClientById } from "@/lib/db/queries/clients";
import { getProjectsByClientId } from "@/lib/db/queries/projects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const [client, projects] = await Promise.all([
    getClientById(id),
    getProjectsByClientId(id),
  ]);

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clients">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-1" /> Clients
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{client.fullName}</h1>
        {client.authUserId && (
          <Badge className="bg-green-500/20 text-green-400">Portal Active</Badge>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-white/10">Projects ({projects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${client.email}`} className="text-blue-400 hover:underline">{client.email}</a>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{client.phone}</span>
                  </div>
                )}
                {client.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{client.company}</span>
                  </div>
                )}
                {client.notes && (
                  <div>
                    <p className="text-gray-400 mb-1">Notes:</p>
                    <p className="text-gray-300 whitespace-pre-wrap">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-base">Portal Access</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {client.authUserId ? (
                  <p className="text-green-400">Client has portal access via magic link</p>
                ) : (
                  <p className="text-gray-400">No portal access set up yet</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Created {new Date(client.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No projects yet</p>
              <Link href={`/admin/projects/new?client_id=${client.id}`}>
                <Button variant="outline" className="mt-3 border-white/10 text-gray-300">
                  Create Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <Link key={project.id} href={`/admin/projects/${project.id}`}>
                  <Card className="border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{project.name}</h3>
                        <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400">
                          {project.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-[#03FF00] h-2 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {project.completedMilestones}/{project.totalMilestones} milestones — {project.progress}%
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
