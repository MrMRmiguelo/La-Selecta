import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash2, Wallet, Calendar } from "lucide-react";

interface Expense {
  id: number;
  date: string;
  amount: number;
  description: string;
  category: string;
}

interface CashRegister {
  id: number;
  date: string;
  opening_amount: number;
  closing_amount?: number;
  notes?: string;
}

interface ExpensesAndCashRegisterProps {
  startDate: Date;
  endDate: Date;
  onExpensesTotalChange: (total: number) => void;
}

export function ExpensesAndCashRegister({ startDate, endDate, onExpensesTotalChange }: ExpensesAndCashRegisterProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', description: '', category: '' });
  const [cashAmount, setCashAmount] = useState('');
  const [cashNotes, setCashNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  useEffect(() => {
    fetchExpenses();
    fetchCashRegister();
  }, [startDate, endDate, selectedDate]);

  useEffect(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    onExpensesTotalChange(total);
  }, [expenses, onExpensesTotalChange]);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('date', selectedDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return;
      }

      setExpenses(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCashRegister = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('cash_register')
        .select('*')
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cash register:', error);
        return;
      }

      setCashRegister(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          date: selectedDate,
          amount: parseFloat(newExpense.amount),
          description: newExpense.description,
          category: newExpense.category || 'General'
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding expense:', error);
        toast({
          title: "Error",
          description: "No se pudo agregar el egreso",
          variant: "destructive"
        });
        return;
      }

      setExpenses([data, ...expenses]);
      setNewExpense({ amount: '', description: '', category: '' });
      setExpenseDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Egreso agregado correctamente"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting expense:', error);
        return;
      }

      setExpenses(expenses.filter(expense => expense.id !== id));
      toast({
        title: "Éxito",
        description: "Egreso eliminado correctamente"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openCashRegister = async () => {
    if (!cashAmount) {
      toast({
        title: "Error",
        description: "Por favor ingresa el monto de apertura",
        variant: "destructive"
      });
      return;
    }

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('cash_register')
        .insert({
          date: today,
          opening_amount: parseFloat(cashAmount),
          notes: cashNotes
        })
        .select()
        .single();

      if (error) {
        console.error('Error opening cash register:', error);
        toast({
          title: "Error",
          description: "No se pudo abrir la caja",
          variant: "destructive"
        });
        return;
      }

      setCashRegister(data);
      setCashAmount('');
      setCashNotes('');
      setCashDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Caja abierta correctamente"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const closeCashRegister = async () => {
    if (!cashRegister || !cashAmount) {
      toast({
        title: "Error",
        description: "Por favor ingresa el monto de cierre",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cash_register')
        .update({
          closing_amount: parseFloat(cashAmount),
          notes: cashNotes
        })
        .eq('id', cashRegister.id)
        .select()
        .single();

      if (error) {
        console.error('Error closing cash register:', error);
        toast({
          title: "Error",
          description: "No se pudo cerrar la caja",
          variant: "destructive"
        });
        return;
      }

      setCashRegister(data);
      setCashAmount('');
      setCashNotes('');
      setCashDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Caja cerrada correctamente"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Cash Register Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Control de Caja
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cashRegister ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Apertura:</span>
                <span className="font-semibold">L {cashRegister.opening_amount.toFixed(2)}</span>
              </div>
              {cashRegister.closing_amount !== null && (
                <div className="flex justify-between">
                  <span>Cierre:</span>
                  <span className="font-semibold">L {cashRegister.closing_amount.toFixed(2)}</span>
                </div>
              )}
              {cashRegister.notes && (
                <div className="text-sm text-gray-600">
                  <strong>Notas:</strong> {cashRegister.notes}
                </div>
              )}
              {cashRegister.closing_amount === null && (
                <Dialog open={cashDialogOpen} onOpenChange={setCashDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-2">
                      Cerrar Caja
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cerrar Caja</DialogTitle>
                      <DialogDescription>
                        Ingresa el monto final de la caja
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="closing-amount">Monto de Cierre</Label>
                        <Input
                          id="closing-amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="closing-notes">Notas (opcional)</Label>
                        <Textarea
                          id="closing-notes"
                          placeholder="Observaciones del cierre..."
                          value={cashNotes}
                          onChange={(e) => setCashNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={closeCashRegister}>Cerrar Caja</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">La caja no ha sido abierta hoy</p>
              <Dialog open={cashDialogOpen} onOpenChange={setCashDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    Abrir Caja
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Abrir Caja</DialogTitle>
                    <DialogDescription>
                      Ingresa el monto inicial de la caja
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="opening-amount">Monto de Apertura</Label>
                      <Input
                        id="opening-amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="opening-notes">Notas (opcional)</Label>
                      <Textarea
                        id="opening-notes"
                        placeholder="Observaciones de la apertura..."
                        value={cashNotes}
                        onChange={(e) => setCashNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={openCashRegister}>Abrir Caja</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Egresos</CardTitle>
            <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Egreso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Egreso</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo gasto o egreso
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      placeholder="Descripción del gasto"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      placeholder="Categoría (opcional)"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addExpense}>Agregar Egreso</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Calendar className="h-4 w-4" />
            <Label htmlFor="expense-date">Filtrar por fecha:</Label>
            <Input
              id="expense-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.date), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right text-red-600">
                      L {expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={3} className="font-bold">Total Egresos</TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    L {totalExpenses.toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No hay egresos registrados para el {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: es })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}