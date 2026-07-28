import React, { useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { Contact } from "../types";
import { Users, Plus, Search, Phone, Mail, MapPin, Tag, Pencil, Trash2, X } from "lucide-react";

export const ContactsView: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact } = useAuction();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<any>("comprador");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("São Paulo");
  const [notes, setNotes] = useState("");

  const filteredContacts = (contacts || []).filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const cType = c.type || c.contactType || "";
    const matchesType = typeFilter === "todos" || cType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenNew = () => {
    setEditingContact(null);
    setName("");
    setType("comprador");
    setPhone("");
    setEmail("");
    setCity("São Paulo");
    setNotes("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setEditingContact(c);
    setName(c.name);
    setType(c.type || c.contactType || "comprador");
    setPhone(c.phone);
    setEmail(c.email);
    setCity(c.city || "São Paulo");
    setNotes(c.notes || "");
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, cName: string) => {
    if (window.confirm(`Deseja excluir o contato "${cName}"?`)) {
      deleteContact(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingContact) {
      updateContact(editingContact.id, {
        name,
        type,
        contactType: type,
        phone,
        email,
        city,
        state: "SP",
        notes,
      });
    } else {
      addContact({
        name,
        type,
        contactType: type,
        phone,
        email,
        city,
        state: "SP",
        notes,
      });
    }

    setIsModalOpen(false);
    setEditingContact(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Cadastro Geral de Contatos</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compradores, Leiloeiros, Transportadoras, Mecânicos e Fornecedores de Peças
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Contato</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, telefone, e-mail..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="comprador">Compradores</option>
          <option value="leiloeiro">Leiloeiros</option>
          <option value="transportadora">Transportadoras</option>
          <option value="prestador_servico">Prestadores / Mecânicos</option>
          <option value="fornecedor_pecas">Fornecedores de Peças</option>
        </select>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 text-xs relative group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {(c.type || c.contactType || "").replace("_", " ")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(c)}
                  title="Editar Contato"
                  className="p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  title="Excluir Contato"
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</h3>
              {(c.companyName || c.company) && (
                <p className="text-[11px] text-slate-400">{c.companyName || c.company}</p>
              )}
            </div>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{c.city || "São Paulo"} - {c.state || "SP"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Contact Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingContact ? "Editar Contato" : "Novo Contato"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tipo de Contato</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="comprador">Comprador</option>
                  <option value="leiloeiro">Leiloeiro</option>
                  <option value="transportadora">Transportadora</option>
                  <option value="prestador_servico">Prestador de Serviço</option>
                  <option value="fornecedor_pecas">Fornecedor de Peças</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 font-bold text-slate-950"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
