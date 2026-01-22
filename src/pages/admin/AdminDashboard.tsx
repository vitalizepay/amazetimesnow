import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, Plus, Pencil, Trash2, Newspaper } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Session } from '@supabase/supabase-js';
import { z } from 'zod';

interface Party {
  id: string;
  name_en: string;
  name_ta: string;
  slug: string;
  color: string;
}

interface NewsItem {
  id: string;
  title_en: string;
  title_ta: string;
  content_en: string;
  content_ta: string;
  slug: string;
  category: string;
  featured_image: string | null;
  published_at: string;
  status: string;
  is_breaking: boolean;
  is_featured: boolean;
  source: string;
  party_id: string | null;
  parties: Party | null;
}

const newsSchema = z.object({
  title_en: z.string().min(1, 'English title is required').max(500),
  title_ta: z.string().min(1, 'Tamil title is required').max(500),
  content_en: z.string().min(1, 'English content is required'),
  content_ta: z.string().min(1, 'Tamil content is required'),
  category: z.string().min(1, 'Category is required'),
  party_id: z.string().nullable(),
});

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title_en: '',
    title_ta: '',
    content_en: '',
    content_ta: '',
    category: 'general',
    party_id: '',
    featured_image: '',
    is_breaking: false,
    is_featured: false,
    status: 'published',
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: parties } = useQuery({
    queryKey: ['admin-parties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parties')
        .select('id, name_en, name_ta, slug, color')
        .order('name_en');
      if (error) throw error;
      return data as Party[];
    },
    enabled: !!user,
  });

  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          parties (id, name_en, name_ta, slug, color)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as NewsItem[];
    },
    enabled: !!user,
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const slug = data.title_en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 100) + '-' + Date.now();

      const { error } = await supabase.from('news').insert({
        title_en: data.title_en,
        title_ta: data.title_ta,
        content_en: data.content_en,
        content_ta: data.content_ta,
        slug,
        category: data.category,
        party_id: data.party_id || null,
        featured_image: data.featured_image || null,
        is_breaking: data.is_breaking,
        is_featured: data.is_featured,
        status: data.status,
        source: 'manual',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news-latest'] });
      toast({ title: 'Success', description: 'News article created successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('news')
        .update({
          title_en: data.title_en,
          title_ta: data.title_ta,
          content_en: data.content_en,
          content_ta: data.content_ta,
          category: data.category,
          party_id: data.party_id || null,
          featured_image: data.featured_image || null,
          is_breaking: data.is_breaking,
          is_featured: data.is_featured,
          status: data.status,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news-latest'] });
      toast({ title: 'Success', description: 'News article updated successfully' });
      resetForm();
      setEditingNews(null);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast({ title: 'Success', description: 'News article deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_ta: '',
      content_en: '',
      content_ta: '',
      category: 'general',
      party_id: '',
      featured_image: '',
      is_breaking: false,
      is_featured: false,
      status: 'published',
    });
  };

  const handleEdit = (item: NewsItem) => {
    setEditingNews(item);
    setFormData({
      title_en: item.title_en,
      title_ta: item.title_ta,
      content_en: item.content_en,
      content_ta: item.content_ta,
      category: item.category,
      party_id: item.party_id || '',
      featured_image: item.featured_image || '',
      is_breaking: item.is_breaking,
      is_featured: item.is_featured,
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = newsSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (editingNews) {
      updateNewsMutation.mutate({ id: editingNews.id, data: formData });
    } else {
      createNewsMutation.mutate(formData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6" />
            <h1 className="text-xl font-serif font-bold">Amazetimes Now Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">{user.email}</span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="news">
          <TabsList className="mb-6">
            <TabsTrigger value="news">News Articles</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>News Articles</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    resetForm();
                    setEditingNews(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Article
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingNews ? 'Edit Article' : 'Create New Article'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title (English)</Label>
                          <Input
                            value={formData.title_en}
                            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title (Tamil)</Label>
                          <Input
                            value={formData.title_ta}
                            onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                            className="font-tamil"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Content (English)</Label>
                        <Textarea
                          value={formData.content_en}
                          onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Content (Tamil)</Label>
                        <Textarea
                          value={formData.content_ta}
                          onChange={(e) => setFormData({ ...formData, content_ta: e.target.value })}
                          rows={4}
                          className="font-tamil"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Party</Label>
                          <Select
                            value={formData.party_id}
                            onValueChange={(val) => setFormData({ ...formData, party_id: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select party" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No Party</SelectItem>
                              {parties?.map((party) => (
                                <SelectItem key={party.id} value={party.id}>
                                  {party.name_en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="elections">Elections</SelectItem>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="statements">Statements</SelectItem>
                              <SelectItem value="protests">Protests</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Featured Image URL (optional)</Label>
                        <Input
                          value={formData.featured_image}
                          onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_breaking}
                            onChange={(e) => setFormData({ ...formData, is_breaking: e.target.checked })}
                            className="rounded"
                          />
                          Breaking News
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="rounded"
                          />
                          Featured
                        </label>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            resetForm();
                            setEditingNews(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
                        >
                          {(createNewsMutation.isPending || updateNewsMutation.isPending) ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          {editingNews ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {newsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Party</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {news?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-[300px]">
                            <div className="truncate font-medium">{item.title_en}</div>
                            <div className="truncate text-sm text-muted-foreground font-tamil">
                              {item.title_ta}
                            </div>
                          </TableCell>
                          <TableCell>{item.parties?.name_en || '-'}</TableCell>
                          <TableCell className="capitalize">{item.category}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize">{item.source}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this article?')) {
                                    deleteNewsMutation.mutate(item.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parties">
            <Card>
              <CardHeader>
                <CardTitle>Political Parties</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Color</TableHead>
                      <TableHead>Name (English)</TableHead>
                      <TableHead>Name (Tamil)</TableHead>
                      <TableHead>Slug</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parties?.map((party) => (
                      <TableRow key={party.id}>
                        <TableCell>
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: party.color }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{party.name_en}</TableCell>
                        <TableCell className="font-tamil">{party.name_ta}</TableCell>
                        <TableCell className="text-muted-foreground">{party.slug}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
