import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Importação corrigida da instância Axios
import RegistrationForm from './RegistrationForm'; // Importa o visual

const Registration = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    chipNumber: '',
    equipe: '',
    dataNascimento: '',
    apelido: '',
    nomeCompleto: '',
    rg: '',
    cpf: '',
    convenioMedico: '',
    endereco: '',
    tel: '',
    telUrgencia: '',
    totalCategorias: 0,
    // Inicia com 2 linhas padrão como na ficha de papel
    inscricoes: [
      { id: 1, categorias: [], moto: '', numero: '' },
      { id: 2, categorias: [], moto: '', numero: '' }
    ],
    localData: '',
    termoAceito: false
  });

  // Atualiza o total de categorias sempre que mudar as inscrições
  useEffect(() => {
    const total = formData.inscricoes.reduce((acc, curr) => acc + curr.categorias.length, 0);
    setFormData(prev => ({ ...prev, totalCategorias: total }));
  }, [formData.inscricoes]);

  // Máscaras de Input
  const maskCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const maskDate = (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{4})\d+?$/, '$1');
  const maskPhone = (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');

  // Manipulação de Inputs Gerais
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;

    if (name === 'cpf') finalValue = maskCPF(value);
    if (name === 'dataNascimento' || name === 'localData') finalValue = maskDate(value);
    if (name === 'tel' || name === 'telUrgencia') finalValue = maskPhone(value);

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : finalValue
    }));
  };

  // Manipulação dos Campos de Moto/#
  const handleInscricaoChange = (index, field, value) => {
    const newInscricoes = [...formData.inscricoes];
    newInscricoes[index][field] = value;
    setFormData(prev => ({ ...prev, inscricoes: newInscricoes }));
  };

  // Manipulação dos "Botões/Checkboxes" de Categoria
  const toggleCategoria = (indexInscricao, catNum) => {
    const newInscricoes = [...formData.inscricoes];
    const currentCats = newInscricoes[indexInscricao].categorias;

    if (currentCats.includes(catNum)) {
      newInscricoes[indexInscricao].categorias = currentCats.filter(c => c !== catNum);
    } else {
      newInscricoes[indexInscricao].categorias = [...currentCats, catNum];
    }
    setFormData(prev => ({ ...prev, inscricoes: newInscricoes }));
  };

  // Adicionar Nova Linha de Moto
  const addInscricaoRow = () => {
    setFormData(prev => ({
      ...prev,
      inscricoes: [...prev.inscricoes, { id: Date.now(), categorias: [], moto: '', numero: '' }]
    }));
  };

  // Remover Linha de Moto
  const removeInscricaoRow = (id) => {
    if (formData.inscricoes.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      inscricoes: prev.inscricoes.filter(item => item.id !== id)
    }));
  };

  // Envio do Formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.termoAceito) {
      setError('É obrigatório aceitar o Termo de Responsabilidade.');
      return;
    }

    if (formData.totalCategorias === 0) {
      setError('Selecione pelo menos uma categoria.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/register', formData);
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao realizar inscrição.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationForm 
      formData={formData}
      handleChange={handleChange}
      handleInscricaoChange={handleInscricaoChange}
      toggleCategoria={toggleCategoria}
      addInscricaoRow={addInscricaoRow}
      removeInscricaoRow={removeInscricaoRow}
      handleSubmit={handleSubmit}
      loading={loading}
      error={error}
      success={success}
    />
  );
};

export default Registration;