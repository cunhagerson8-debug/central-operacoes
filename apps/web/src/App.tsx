import { useEffect, useState, type FormEvent } from 'react';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type Company = {
  id: string;
  name: string;
  legalName?: string;
  document?: string;
  documentType?: string;
  status?: string;
  notes?: string;
  holderId?: string;
  phone?: string;
  email?: string;
  capitalSocial?: number | string;
taxRegime?: string;
companySize?: string;
cnae?: string;
businessActivity?: string;
};

type Holder = {
  id: string;
  fullName: string;
  cpf?: string;
};

type DriverCompany = {
  company: {
    id: string;
    name: string;
    status?: string;
  };
};

type Driver = {
  id: string;
  fullName: string;
  cpf?: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  driverCompanies: DriverCompany[];
};

type Device = {
  id: string;
  companyId: string;
  phoneNumber?: string;
  imei?: string;
  manufacturer?: string;
  model?: string;
  androidVersion?: string;
  simCarrier?: string;
  connectionType: 'WIFI' | 'MOBILE' | 'UNKNOWN';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  notes?: string;
  company: { id: string; name: string };
  driver?: { id: string; fullName: string } | null;
  currentStatus?: {
    isOnline: boolean;
    batteryLevel?: number | null;
    isCharging: boolean;
    lastSeenAt?: string | null;
    lastSyncAt?: string | null;
    lastLatitude?: number | null;
    lastLongitude?: number | null;
    lastLocationAt?: string | null;
  } | null;
  batterySurvivalStatus: 'NORMAL' | 'ATTENTION' | 'CRITICAL' | 'EMERGENCY' | 'UNKNOWN';
  _count?: { smsMessages: number };
  smsMessages?: SmsMessage[];
};

type SmsMessage = {
  id: string;
  sender: string;
  message: string;
  receivedAt: string;
  readAt?: string | null;
  device?: {
    id: string;
    phoneNumber?: string | null;
    company?: { id: string; name: string };
    driver?: { id: string; fullName: string } | null;
  };
};

type Marketplace = { id: string; name: string; code: string; active: boolean };
type MarketplaceAccount = {
  id: string;
  companyId: string;
  marketplaceId: string;
  status: 'ACTIVE' | 'PENDING' | 'DISCONNECTED' | 'BLOCKED' | 'ERROR' | 'INACTIVE';
  notes?: string;
  lastCheckedAt?: string | null;
  marketplace: Marketplace;
  company: { id: string; name: string };
};

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem('accessToken'),
  );

  const [currentUser, setCurrentUser] = useState<any>(() => {
  const savedUser = localStorage.getItem('currentUser');
  return savedUser ? JSON.parse(savedUser) : null;
});

  const [showCompanies, setShowCompanies] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
const [showPayments, setShowPayments] = useState(false);
const [showAiImport, setShowAiImport] = useState(false);
const [aiImportText, setAiImportText] = useState('');
const [aiImportLoading, setAiImportLoading] = useState(false);
const [aiImportError, setAiImportError] = useState('');
const [aiImportPreview, setAiImportPreview] = useState<any>(null);
const [aiImportFile, setAiImportFile] = useState<File | null>(null);
const [paymentBeneficiaries, setPaymentBeneficiaries] = useState<any[]>([]);
const [paymentBeneficiariesLoading, setPaymentBeneficiariesLoading] = useState(false);
const [paymentBeneficiariesError, setPaymentBeneficiariesError] = useState('');
const [payments, setPayments] = useState<any[]>([]);
const [paymentsLoading, setPaymentsLoading] = useState(false);
const [paymentsError, setPaymentsError] = useState('');
 const [showNewPaymentBeneficiary, setShowNewPaymentBeneficiary] = useState(false);
const [newPaymentBeneficiaryName, setNewPaymentBeneficiaryName] = useState('');
const [newPaymentBeneficiaryDocument, setNewPaymentBeneficiaryDocument] = useState('');
const [newPaymentBeneficiaryPixKey, setNewPaymentBeneficiaryPixKey] = useState('');
const [newPaymentBeneficiaryBank, setNewPaymentBeneficiaryBank] = useState('');
const [newPaymentBeneficiaryAgency, setNewPaymentBeneficiaryAgency] = useState('');
const [newPaymentBeneficiaryAccount, setNewPaymentBeneficiaryAccount] = useState('');
const [newPaymentBeneficiaryLoading, setNewPaymentBeneficiaryLoading] = useState(false);
const [newPaymentBeneficiaryError, setNewPaymentBeneficiaryError] = useState('');
const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
const [newUserEmail, setNewUserEmail] = useState('');
const [newUserPassword, setNewUserPassword] = useState('');
const [newUserRole, setNewUserRole] = useState('GESTOR');
const [newUserError, setNewUserError] = useState('');
  const [showDrivers, setShowDrivers] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [showMarketplaces, setShowMarketplaces] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [dashboardCompanies, setDashboardCompanies] = useState<Company[]>([]);
  const [companiesPage, setCompaniesPage] = useState(1);
  const [companiesTotal, setCompaniesTotal] = useState(0);
  const [companiesTotalPages, setCompaniesTotalPages] = useState(1);
  const [companySearch] = useState('');
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState('');
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [holdersLoading, setHoldersLoading] = useState(false);
  const [showHolderForm, setShowHolderForm] = useState(false);
const [holderFormLoading, setHolderFormLoading] = useState(false);
const [holderFormError, setHolderFormError] = useState('');
const [holderFullName, setHolderFullName] = useState('');
const [holderCpf, setHolderCpf] = useState('');
const [holderPhone, setHolderPhone] = useState('');
const [holderEmail, setHolderEmail] = useState('');
  const [companyFormLoading, setCompanyFormLoading] = useState(false);
  const [companyFormError, setCompanyFormError] = useState('');
  const [companiesSuccess, setCompaniesSuccess] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyCapitalSocial, setCompanyCapitalSocial] = useState('');
const [companyTaxRegime, setCompanyTaxRegime] = useState('');
const [companySize, setCompanySize] = useState('');
const [companyCnae, setCompanyCnae] = useState('');
const [companyBusinessActivity, setCompanyBusinessActivity] = useState('');
  const [companyLegalName, setCompanyLegalName] = useState('');
  const [companyDocument, setCompanyDocument] = useState('');
  const [companyDocumentType, setCompanyDocumentType] = useState('CNPJ');
  const [companyHolderId, setCompanyHolderId] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyNotes, setCompanyNotes] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [driversError, setDriversError] = useState('');
  const [driverFormLoading, setDriverFormLoading] = useState(false);
  const [driverFormError, setDriverFormError] = useState('');
  const [driverFullName, setDriverFullName] = useState('');
  const [driverCpf, setDriverCpf] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverStatus, setDriverStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [driverNotes, setDriverNotes] = useState('');
  function updateCompanyDevice(
  index: number,
  field: keyof CompanyDeviceForm,
  value: string,
) {
  setCompanyDevices((current) =>
    current.map((device, deviceIndex) =>
      deviceIndex === index ? { ...device, [field]: value } : device,
    ),
  );
}

function addCompanyDevice() {
  setCompanyDevices((current) => [
    ...current,
    {
      phoneNumber: '',
      imei: '',
      manufacturer: '',
      model: '',
      androidVersion: '',
      simCarrier: '',
      connectionType: 'UNKNOWN',
      status: 'ACTIVE',
      notes: '',
    },
  ]);
}

function removeCompanyDevice(index: number) {
  setCompanyDevices((current) =>
    current.length === 1
      ? current
      : current.filter((_, deviceIndex) => deviceIndex !== index),
  );
}
  const [driverCompanyIds, setDriverCompanyIds] = useState<string[]>([]);
  type CompanyDeviceForm = {
  phoneNumber: string;
  imei: string;
  manufacturer: string;
  model: string;
  androidVersion: string;
  simCarrier: string;
  connectionType: 'UNKNOWN' | 'WIFI' | 'MOBILE';
status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  notes: string;
};
const [companyDevices, setCompanyDevices] = useState<CompanyDeviceForm[]>([
  {
    phoneNumber: '',
    imei: '',
    manufacturer: '',
    model: '',
    androidVersion: '',
    simCarrier: '',
    connectionType: 'UNKNOWN',
    status: 'ACTIVE',
    notes: '',
  },
]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [dashboardDevices, setDashboardDevices] = useState<Device[]>([]);
  const [devicesPage, setDevicesPage] = useState(1);
  const [devicesTotal, setDevicesTotal] = useState(0);
  const [devicesTotalPages, setDevicesTotalPages] = useState(1);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState('');
  const [deviceFormLoading, setDeviceFormLoading] = useState(false);
  const [deviceFormError, setDeviceFormError] = useState('');
  const [deviceCompanyId, setDeviceCompanyId] = useState('');
  const [devicePhoneNumber, setDevicePhoneNumber] = useState('');
  const [deviceImei, setDeviceImei] = useState('');
  const [deviceManufacturer, setDeviceManufacturer] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceAndroidVersion, setDeviceAndroidVersion] = useState('');
  const [deviceSimCarrier, setDeviceSimCarrier] = useState('');
  const [deviceConnectionType, setDeviceConnectionType] = useState<'WIFI' | 'MOBILE' | 'UNKNOWN'>('UNKNOWN');
  const [deviceStatus, setDeviceStatus] = useState<'ACTIVE' | 'INACTIVE' | 'BLOCKED'>('ACTIVE');
  const [deviceNotes, setDeviceNotes] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showHolders, setShowHolders] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
const [roles, setRoles] = useState<any[]>([]);
const [rolesLoading, setRolesLoading] = useState(false);
const [rolesError, setRolesError] = useState('');
const [users, setUsers] = useState<any[]>([]);
const [usersLoading, setUsersLoading] = useState(false);
const [usersError, setUsersError] = useState('');
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>([]);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [smsCompanyFilter, setSmsCompanyFilter] = useState('');
  const [smsDeviceFilter, setSmsDeviceFilter] = useState('');
  const [smsDriverFilter, setSmsDriverFilter] = useState('');
  const [smsReadFilter, setSmsReadFilter] = useState('');
  const [smsSearch, setSmsSearch] = useState('');
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [marketplaceAccounts, setMarketplaceAccounts] = useState<MarketplaceAccount[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [marketplaceError, setMarketplaceError] = useState('');
  const [marketplaceCompanyFilter, setMarketplaceCompanyFilter] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('');
  const [marketplaceStatusFilter, setMarketplaceStatusFilter] = useState('');
  const marketplaceStatuses = ['ACTIVE', 'PENDING', 'DISCONNECTED', 'BLOCKED', 'ERROR', 'INACTIVE'] as const;

  async function loadMarketplaces() {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoggedIn(false); return; }
    setMarketplaceLoading(true);
    setMarketplaceError('');
    try {
      const [marketplaceResponse, companiesResponse] = await Promise.all([
        fetch(`${API_URL}/marketplaces`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/companies?page=1&limit=100&search=`, {
  headers: { Authorization: `Bearer ${token}` },
}),
      ]);
      const marketplaceData = await marketplaceResponse.json();
      const companiesData = await companiesResponse.json();
      if (!marketplaceResponse.ok || !companiesResponse.ok) throw new Error('Não foi possível carregar marketplaces.');
      setMarketplaces(Array.isArray(marketplaceData) ? marketplaceData : []);
      const companiesList: Company[] = Array.isArray(companiesData)
  ? companiesData
  : Array.isArray(companiesData?.data)
    ? companiesData.data
    : [];

const companyIds = marketplaceCompanyFilter
  ? [marketplaceCompanyFilter]
  : companiesList.map((company) => company.id);
      const accountResponses = await Promise.all(companyIds.map((companyId) => fetch(`${API_URL}/companies/${companyId}/marketplaces`, { headers: { Authorization: `Bearer ${token}` } })));
      const accountData = await Promise.all(accountResponses.map((response) => response.json()));
      setMarketplaceAccounts(accountData.flatMap((accounts) => Array.isArray(accounts) ? accounts : []));
    } catch (err) {
      setMarketplaceError(err instanceof Error ? err.message : 'Erro ao carregar marketplaces.');
    } finally {
      setMarketplaceLoading(false);
    }
  }

  async function updateMarketplaceAccount(account: MarketplaceAccount, status: MarketplaceAccount['status']) {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoggedIn(false); return; }
    await fetch(`${API_URL}/companies/${account.companyId}/marketplaces/${account.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadMarketplaces();
  }

function isLocationStale(device: Device) {
  const lastLocationAt = device.currentStatus?.lastLocationAt;

  if (!lastLocationAt) return true;

  const lastLocationTime = new Date(lastLocationAt).getTime();
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

  return lastLocationTime < thirtyMinutesAgo;
}

  function openDeviceLocation(device: Device) {
  const latitude = device.currentStatus?.lastLatitude;
  const longitude = device.currentStatus?.lastLongitude;

  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    window.alert('Este aparelho ainda não enviou nenhuma localização.');
    return;
  }

  window.open(
    `https://www.google.com/maps?q=${latitude},${longitude}`,
    '_blank',
    'noopener,noreferrer',
  );
}

  async function loadSms() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoggedIn(false);
      return;
    }

    setSmsLoading(true);
    setSmsError('');
    const params = new URLSearchParams();
    if (smsCompanyFilter) params.set('companyId', smsCompanyFilter);
    if (smsDeviceFilter) params.set('deviceId', smsDeviceFilter);
    if (smsDriverFilter) params.set('driverId', smsDriverFilter);
    if (smsReadFilter) params.set('read', smsReadFilter);
    if (smsSearch.trim()) params.set('search', smsSearch.trim());

    try {
      const response = await fetch(`${API_URL}/sms?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Não foi possível carregar os SMS.');
      setSmsMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setSmsError(err instanceof Error ? err.message : 'Erro ao carregar SMS.');
    } finally {
      setSmsLoading(false);
    }
  }

  async function markSmsAsRead(id: string) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoggedIn(false);
      return;
    }

    await fetch(`${API_URL}/sms/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadSms();
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Usuário ou senha inválidos.',
        );
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setLoggedIn(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível realizar o login.',
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setLoggedIn(false);
    setShowCompanies(false);
    setEmail('');
    setPassword('');
  }

  async function handleDeactivateUser(userId: string, userName: string) {
  const confirmed = window.confirm(
    `Deseja realmente desativar o usuário "${userName}"?`
  );

  if (!confirmed) return;

  const token = localStorage.getItem('accessToken');

  try {
    const response = await fetch(`${API_URL}/users/${userId}/deactivate`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Não foi possível desativar o usuário.'
      );
    }

    await loadUsers();
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : 'Erro ao desativar o usuário.'
    );
  }
}

async function handleActivateUser(userId: string, userName: string) {
  const confirmed = window.confirm(
    `Deseja realmente reativar o usuário "${userName}"?`
  );

  if (!confirmed) return;

  const token = localStorage.getItem('accessToken');

  try {
    const response = await fetch(`${API_URL}/users/${userId}/activate`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Não foi possível reativar o usuário.'
      );
    }

    await loadUsers();
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : 'Erro ao reativar o usuário.'
    );
  }
}

async function loadPaymentBeneficiaries() {


  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  setPaymentBeneficiariesLoading(true);
  setPaymentBeneficiariesError('');

  try {
    const response = await fetch(
      `${API_URL}/payments/beneficiaries`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Não foi possível carregar os beneficiários.',
      );
    }

    setPaymentBeneficiaries(data);
  } catch (err) {
    setPaymentBeneficiariesError(
      err instanceof Error
        ? err.message
        : 'Erro ao carregar os beneficiários.',
    );
  } finally {
    setPaymentBeneficiariesLoading(false);
  }
}

async function loadPayments() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  setPaymentsLoading(true);
  setPaymentsError('');

  try {
    const response = await fetch(`${API_URL}/payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Não foi possível carregar os pagamentos.',
      );
    }

    setPayments(Array.isArray(data) ? data : []);
  } catch (err) {
    setPaymentsError(
      err instanceof Error
        ? err.message
        : 'Erro ao carregar os pagamentos.',
    );
  } finally {
    setPaymentsLoading(false);
  }
}

async function createPaymentBeneficiary() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  if (!newPaymentBeneficiaryName.trim()) {
    setNewPaymentBeneficiaryError('Informe o nome do beneficiário.');
    return;
  }

  setNewPaymentBeneficiaryLoading(true);
  setNewPaymentBeneficiaryError('');

  try {
    const response = await fetch(
      `${API_URL}/payments/beneficiaries`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newPaymentBeneficiaryName.trim(),
          document: newPaymentBeneficiaryDocument.trim() || undefined,
          pixKey: newPaymentBeneficiaryPixKey.trim() || undefined,
          bankName: newPaymentBeneficiaryBank.trim() || undefined,
          agency: newPaymentBeneficiaryAgency.trim() || undefined,
          account: newPaymentBeneficiaryAccount.trim() || undefined,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Não foi possível cadastrar o beneficiário.',
      );
    }

    setNewPaymentBeneficiaryName('');
    setNewPaymentBeneficiaryDocument('');
    setNewPaymentBeneficiaryPixKey('');
    setNewPaymentBeneficiaryBank('');
    setNewPaymentBeneficiaryAgency('');
    setNewPaymentBeneficiaryAccount('');
    setShowNewPaymentBeneficiary(false);

    await loadPaymentBeneficiaries();
    } catch (err) {
    setNewPaymentBeneficiaryError(
      err instanceof Error
        ? err.message
        : 'Erro ao cadastrar o beneficiário.',
    );
  } finally {
    setNewPaymentBeneficiaryLoading(false);
  }
}

async function deletePaymentBeneficiary(id: string, name: string) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }


  
  const confirmed = window.confirm(
    `Deseja realmente excluir o beneficiário "${name}"?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/payments/beneficiaries/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Não foi possível excluir o beneficiário.',
      );
    }

    await loadPaymentBeneficiaries();
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : 'Erro ao excluir o beneficiário.',
    );
  }
}

async function editPayment(payment: any) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  const description = window.prompt(
    'Descrição do pagamento:',
    payment.description || '',
  );
  if (description === null) return;

  const amountText = window.prompt(
    'Valor do pagamento:',
    String(payment.amount || ''),
  );
  if (amountText === null) return;

  const dueDayText = window.prompt(
    'Dia do vencimento:',
    String(payment.dueDay || ''),
  );
  if (dueDayText === null) return;

  const amount = Number(
    amountText.replace(/\./g, '').replace(',', '.'),
  );

  const dueDay = dueDayText.trim()
    ? Number(dueDayText)
    : undefined;

  try {
    const response = await fetch(`${API_URL}/payments/${payment.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        description: description.trim(),
        amount,
        dueDay,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(
        data?.message || 'Não foi possível editar o pagamento.',
      );
    }

    await loadPayments();
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : 'Erro ao editar o pagamento.',
    );
  }
}


async function deletePayment(payment: any) {
  const confirmed = window.confirm(
    `Deseja realmente excluir este pagamento?\n\n` +
    `Beneficiário: ${payment.beneficiary?.name || 'Não informado'}\n` +
    `Descrição: ${payment.description || 'Não informada'}\n` +
    `Valor: R$ ${Number(payment.amount || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
    })}`
  );

  if (!confirmed) return;

  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/payments/${payment.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || 'Não foi possível excluir o pagamento.');
    }

    await loadPayments();
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : 'Erro ao excluir o pagamento.'
    );
  }
}

async function analyzeAiImport() {
  if (!aiImportText.trim() && !aiImportFile) {
    setAiImportError('Cole os dados ou selecione uma planilha antes de analisar.');
    setAiImportPreview(null);
    return;
  }

  setAiImportLoading(true);
  setAiImportError('');

  try {
    // PLANILHA EXCEL
    if (aiImportFile) {
      const arrayBuffer = await aiImportFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Prioriza a aba principal "资料"
      const targetSheetName =
        workbook.SheetNames.find((name) => name === '资料') ??
        workbook.SheetNames[1] ??
        workbook.SheetNames[0];

      if (!targetSheetName) {
        throw new Error('A planilha não possui abas válidas.');
      }

      const sheet = workbook.Sheets[targetSheetName];

      const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: '',
      });


const paymentSheet = workbook.Sheets['PAGAMENTOS'];
let paymentPreview: any[] = [];

if (paymentSheet) {
  const paymentRows = XLSX.utils.sheet_to_json<unknown[]>(paymentSheet, {
    header: 1,
    defval: '',
  });

  let currentGroup = '';

  paymentPreview = paymentRows
  .map((row) => {
    const groupCell = String(row?.[0] ?? '').trim();

if (groupCell) {
  currentGroup = groupCell;
}

const group = currentGroup;
    const dueDayRaw = String(row?.[1] ?? '').trim();
    const product = String(row?.[2] ?? '').trim();
    const amountRaw = row?.[3];
    const client = String(row?.[4] ?? '').trim();
    const months = String(row?.[5] ?? '').trim();

    const amount =
      typeof amountRaw === 'number'
        ? amountRaw
        : Number(
            String(amountRaw ?? '')
              .replace(/\./g, '')
              .replace(',', '.')
              .replace(/[^\d.-]/g, ''),
          );

    const dueDayMatch = dueDayRaw.match(/\d+/);
    const dueDay = dueDayMatch ? Number(dueDayMatch[0]) : undefined;

    return {
      group,
      dueDay,
      product,
      amount: Number.isFinite(amount) ? amount : 0,
      client,
      months,
    };
  })
  .filter((item) => item.product && item.amount > 0);

console.table(paymentPreview);

  }
      // Nesta planilha as linhas 1 e 2 são cabeçalhos.
      // A primeira empresa real começa na linha 3: A501 - ANDGUSSO.
      const dataRows = rows.slice(2).filter((row) => {
        const companyNumber = String(row?.[1] ?? '').trim();
        const companyName = String(row?.[2] ?? '').trim();

        return companyNumber !== '' || companyName !== '';
      });

      const rowValue = (row: unknown[], index: number) =>
  String(row?.[index] ?? '').trim();

const companiesPreview = dataRows.map((row) => {
  const companyNumber = rowValue(row, 1);
  const companyName = rowValue(row, 2);

  const marketplaces = [
    { name: 'Shopee', status: rowValue(row, 7) },
    { name: 'Mercado Livre', status: rowValue(row, 8) },
    { name: 'TikTok Shop', status: rowValue(row, 9) },
    { name: 'Temu', status: rowValue(row, 10) },
  ]
    .filter(({ status }) => {
      const normalized = status.toLowerCase();

      return (
        status === '√' ||
        normalized === 'sim' ||
        normalized === 'ativo' ||
        normalized === 'ok'
      );
    })
    .map(({ name }) => name);

  return {
    number: companyNumber,
    name: companyName,
    company: [companyNumber, companyName].filter(Boolean).join(' - '),
    phone: rowValue(row, 21),
    marketplaces,
  };
});

if (companiesPreview.length === 0) {
  throw new Error('Nenhuma empresa foi encontrada na aba principal.');
}

const firstCompany = companiesPreview[0];

setAiImportPreview({
  originalText: `Arquivo: ${aiImportFile.name} | Aba: ${targetSheetName}`,
  detectedType: 'Planilha de empresas',
  company: firstCompany.company,
  document: '',
  beneficiary: '',
  beneficiaryDocument: '',
  pixKey: '',
  paymentAmount: '',
  marketplace: firstCompany.marketplaces.join(', '),
  phone: firstCompany.phone,

  totalCompanies: companiesPreview.length,
  companies: companiesPreview,
  payments: paymentPreview,
  });
  
return;
    }
    // TEXTO COLADO MANUALMENTE
    const companyMatch = aiImportText.match(/Empresa:\s*(.+)/i);
    const companyDocumentMatch = aiImportText.match(
      /CNPJ:\s*([0-9./-]+)/i,
    );
    const beneficiaryMatch = aiImportText.match(/Beneficiário:\s*(.+)/i);
    const beneficiaryDocumentMatch = aiImportText.match(
      /CPF:\s*([0-9.-]+)/i,
    );
    const pixMatch = aiImportText.match(/PIX:\s*(.+)/i);
    const paymentMatch = aiImportText.match(/Pagamento:\s*(.+)/i);
    const marketplaceMatch = aiImportText.match(/Marketplace:\s*(.+)/i);
    const phoneMatch = aiImportText.match(/Celular:\s*(.+)/i);

    setAiImportPreview({
      originalText: aiImportText.trim(),
      detectedType: 'Dados colados manualmente',
      company: companyMatch?.[1]?.trim() || '',
      document: companyDocumentMatch?.[1]?.trim() || '',
      beneficiary: beneficiaryMatch?.[1]?.trim() || '',
      beneficiaryDocument: beneficiaryDocumentMatch?.[1]?.trim() || '',
      pixKey: pixMatch?.[1]?.trim() || '',
      paymentAmount: paymentMatch?.[1]?.trim() || '',
      marketplace: marketplaceMatch?.[1]?.trim() || '',
      phone: phoneMatch?.[1]?.trim() || '',
    });
  } catch (err) {
    setAiImportError(
      err instanceof Error
        ? err.message
        : 'Não foi possível analisar os dados.',
    );
    setAiImportPreview(null);
  } finally {
    setAiImportLoading(false);
  }
}

async function confirmAiCompanyImport() {
  if (
    !aiImportPreview ||
    !Array.isArray(aiImportPreview.companies) ||
    aiImportPreview.companies.length === 0
  ) {
    setAiImportError('Nenhuma empresa encontrada para importação.');
    return;
  }

  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  setAiImportLoading(true);
  setAiImportError('');

  let imported = 0;
  let failed = 0;

  try {
    for (const company of aiImportPreview.companies) {
      try {
       const companyNumber = String(company.number || '').trim();
const companyName = String(company.name || '').trim();

if (!companyNumber || !companyName) {
  console.warn(
    'Linha ignorada por estar incompleta:',
    companyNumber || '(sem código)',
    companyName || '(sem nome)',
  );
  continue;
}

        const response = await fetch(`${API_URL}/companies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: companyName,
            legalName: companyName,
            document: `INT-${companyNumber}`,
            documentType: 'INTERNAL',
            phone: String(company.phone || '').trim() || undefined,
            notes: 'Importado automaticamente pela Importação com IA',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          console.error(
            'Erro ao importar empresa:',
            companyName,
            errorData,
          );

          failed++;
          continue;
        }

        const createdCompany = await response.json();

        // Se houver celular na planilha, cadastra o aparelho.
        if (company.phone && createdCompany?.id) {
          const deviceResponse = await fetch(`${API_URL}/devices`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              companyId: createdCompany.id,
              phoneNumber: String(company.phone).trim(),
            }),
          });

          if (!deviceResponse.ok) {
  const deviceError = await deviceResponse.json().catch(() => null);

  console.error(
    'Empresa criada, mas houve erro ao cadastrar celular:',
    companyName,
    deviceError,
  );
}
}
        imported++;
      } catch (companyError) {
        console.error('Erro durante importação:', companyError);
        failed++;
      }
    }

    await loadCompanies();
    await loadDevices();

    if (failed === 0) {
      setAiImportError('');
      alert(`${imported} empresas importadas com sucesso!`);
    } else {
      alert(
        `Importação concluída: ${imported} empresas importadas e ${failed} com erro.`,
      );
    }
  } catch (err) {
    setAiImportError(
      err instanceof Error
        ? err.message
        : 'Erro ao importar as empresas.',
    );
  } finally {
    setAiImportLoading(false);
  }
}

async function confirmAiPaymentImport() {
  if (
    !aiImportPreview ||
    !Array.isArray(aiImportPreview.payments) ||
    aiImportPreview.payments.length === 0
  ) {
    setAiImportError('Nenhum pagamento encontrado na planilha.');
    return;
  }

  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  setAiImportLoading(true);
  setAiImportError('');

  const beneficiariesResponse = await fetch(
  `${API_URL}/payments/beneficiaries`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

const beneficiariesData = await beneficiariesResponse.json();

if (!beneficiariesResponse.ok) {
  throw new Error(
    beneficiariesData.message || 'Não foi possível carregar os beneficiários.',
  );
}

const beneficiariesForImport = Array.isArray(beneficiariesData)
  ? beneficiariesData
  : [];

setPaymentBeneficiaries(beneficiariesForImport);

  let imported = 0;
  let failed = 0;

  try {
    for (const payment of aiImportPreview.payments) {
      try {

const payerName = String(payment.group || '').trim();

let beneficiary = beneficiariesForImport.find(
  (item) =>
    String(item.name || '').trim().toLowerCase() ===
    payerName.toLowerCase(),
);

if (!beneficiary) {
  const beneficiaryResponse = await fetch(
    `${API_URL}/payments/beneficiaries`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: payerName,
        notes: 'Criado automaticamente pela importação de pagamentos',
      }),
    },
  );

  const beneficiaryData = await beneficiaryResponse.json();

  if (!beneficiaryResponse.ok) {
    throw new Error(
      beneficiaryData.message || `Erro ao criar pagador ${payerName}`,
    );
  }

  beneficiary = beneficiaryData;
  beneficiariesForImport.push(beneficiary);
}

        
        const now = new Date();

        const response = await fetch(`${API_URL}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            beneficiaryId: beneficiary.id,
            category: 'OTHER',
            description: String(payment.product || '').trim() || undefined,
            payer: String(payment.group || '').trim() || undefined,
            client: String(payment.client || '').trim() || undefined,
            amount: Number(payment.amount || 0),
            dueDay: payment.dueDay || undefined,
            referenceMonth: now.getMonth() + 1,
            referenceYear: now.getFullYear(),
            status: 'PENDING',
            notes: String(payment.months || '').trim() || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Erro ao importar pagamento:', payment, errorData);
          failed++;
          continue;
        }

        imported++;
      } catch (paymentError) {
        console.error('Erro durante importação do pagamento:', paymentError);
        failed++;
      }
    }

    await loadPayments();

    alert(
      `Importação de pagamentos concluída: ${imported} importados e ${failed} com erro.`
    );
  } catch (err) {
    setAiImportError(
      err instanceof Error
        ? err.message
        : 'Erro ao importar os pagamentos.'
    );
  } finally {
    setAiImportLoading(false);
  }
}

async function confirmAiMarketplaceImport() {
  if (
    !aiImportPreview ||
    !Array.isArray(aiImportPreview.companies) ||
    aiImportPreview.companies.length === 0
  ) {
    setAiImportError('Nenhuma empresa encontrada para importar marketplaces.');
    return;
  }

  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  setAiImportLoading(true);
  setAiImportError('');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const marketplaceResponse = await fetch(`${API_URL}/marketplaces`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const marketplaceData = await marketplaceResponse.json();

    if (!marketplaceResponse.ok) {
      throw new Error(
        marketplaceData.message || 'Não foi possível carregar os marketplaces.',
      );
    }

    const availableMarketplaces: Marketplace[] = Array.isArray(marketplaceData)
      ? marketplaceData
      : [];

    for (const company of aiImportPreview.companies) {
      const companyNumber = String(company.number || '').trim();

      const existingCompany = dashboardCompanies.find(
        (item) => item.document === `INT-${companyNumber}`,
      );

      if (!existingCompany) {
        failed++;
        continue;
      }

      const accountResponse = await fetch(
        `${API_URL}/companies/${existingCompany.id}/marketplaces`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const existingAccounts = await accountResponse.json();

      if (!accountResponse.ok) {
        failed++;
        continue;
      }

      for (const marketplaceName of company.marketplaces || []) {
        const marketplace = availableMarketplaces.find(
          (item) => item.name === marketplaceName,
        );

        // Ex.: Temu ainda não está cadastrado na plataforma.
        if (!marketplace) {
          skipped++;
          continue;
        }

        const alreadyExists = Array.isArray(existingAccounts)
          ? existingAccounts.some(
              (account) => account.marketplaceId === marketplace.id,
            )
          : false;

        if (alreadyExists) {
          skipped++;
          continue;
        }

        const createResponse = await fetch(
          `${API_URL}/companies/${existingCompany.id}/marketplaces`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              marketplaceId: marketplace.id,
              status: 'ACTIVE',
              notes: 'Importado automaticamente da planilha',
            }),
          },
        );

        if (createResponse.ok) {
          created++;
        } else {
          failed++;
        }
      }
    }

    await loadMarketplaces();

    alert(
      `Marketplaces importados: ${created} vínculos criados, ${skipped} ignorados e ${failed} com erro.`,
    );
  } catch (err) {
    setAiImportError(
      err instanceof Error
        ? err.message
        : 'Erro ao importar os marketplaces.',
    );
  } finally {
    setAiImportLoading(false);
  }
}

  async function loadCompanies() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoggedIn(false);
      return;
    }

    setCompaniesLoading(true);
    setCompaniesError('');

    try {
     const response = await fetch(
  `${API_URL}/companies?page=${companiesPage}&limit=50&search=${encodeURIComponent(companySearch)}`,
  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Não foi possível carregar as empresas.',
        );
      }

      setCompanies(Array.isArray(data.data) ? data.data : []);
      setCompaniesTotal(data.total ?? 0);
      setCompaniesTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setCompaniesError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar empresas.',
      );
    } finally {
      setCompaniesLoading(false);
    }
  }

  async function loadDashboardCompanies() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  try {
    let page = 1;
    let totalPages = 1;
    const allCompanies: Company[] = [];

    do {
      const response = await fetch(
        `${API_URL}/companies?page=${page}&limit=50&search=`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Não foi possível carregar as empresas do Dashboard.',
        );
      }

      if (Array.isArray(data.data)) {
        allCompanies.push(...data.data);
      }

      totalPages = data.totalPages ?? 1;
      page++;
    } while (page <= totalPages);

    setDashboardCompanies(allCompanies);
  } catch (err) {
    console.error('Erro ao carregar empresas do Dashboard:', err);
  }
}

  async function loadHolders() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoggedIn(false);
      return;
    }

    setHoldersLoading(true);
    setCompanyFormError('');

    try {
      const response = await fetch(`${API_URL}/holders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sua sessão expirou. Faça login novamente.');
        }

        if (response.status === 403) {
          throw new Error('Você não tem permissão para consultar titulares.');
        }

        throw new Error(
          data.message || 'Não foi possível carregar os titulares.',
        );
      }

      console.log('DADOS DOS TITULARES:', data);
      setHolders(Array.isArray(data) ? data : []);
    } catch (err) {
      setCompanyFormError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar titulares.',
      );
    } finally {
      setHoldersLoading(false);
    }
  }

async function handleCreateHolder(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  setHolderFormLoading(true);
  setHolderFormError('');

  try {
    const response = await fetch(`${API_URL}/holders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: holderFullName.trim(),
        cpf: holderCpf.trim(),
        phone: holderPhone.trim() || undefined,
        email: holderEmail.trim() || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = Array.isArray(data.message)
        ? data.message.join(' ')
        : data.message;

      throw new Error(message || 'Não foi possível cadastrar o titular.');
    }

    setHolderFullName('');
    setHolderCpf('');
    setHolderPhone('');
    setHolderEmail('');
    setShowHolderForm(false);

    await loadHolders();

    window.alert('Titular cadastrado com sucesso!');
  } catch (err) {
    setHolderFormError(
      err instanceof Error ? err.message : 'Erro ao cadastrar titular.',
    );
  } finally {
    setHolderFormLoading(false);
  }
}

  async function loadDrivers() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoggedIn(false);
      return;
    }

    setDriversLoading(true);
    setDriversError('');

    try {
      const response = await fetch(`${API_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível carregar os motoristas.');
      }

      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      setDriversError(
        err instanceof Error ? err.message : 'Erro ao carregar motoristas.',
      );
    } finally {
      setDriversLoading(false);
    }
  }

  async function loadUsers() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  setUsersLoading(true);
  setUsersError('');

  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Não foi possível carregar os usuários.',
      );
    }

    setUsers(Array.isArray(data) ? data : []);
  } catch (err) {
    setUsersError(
      err instanceof Error
        ? err.message
        : 'Erro ao carregar usuários.',
    );
  } finally {
    setUsersLoading(false);
  }
}

async function createUser() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  setNewUserError('');

  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Não foi possível cadastrar o usuário.',
      );
    }

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('GESTOR');
    setShowCreateUser(false);

    await loadUsers();
  } catch (err) {
    setNewUserError(
      err instanceof Error
        ? err.message
        : 'Erro ao cadastrar usuário.',
    );
  }
}

async function loadRoles() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  setRolesLoading(true);
  setRolesError('');

  try {
    const response = await fetch(`${API_URL}/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Não foi possível carregar as permissões.',
      );
    }

    setRoles(Array.isArray(data) ? data : []);
  } catch (err) {
    setRolesError(
      err instanceof Error
        ? err.message
        : 'Erro ao carregar permissões.',
    );
  } finally {
    setRolesLoading(false);
  }
}

  async function loadDevices() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoggedIn(false);
      return;
    }

    setDevicesLoading(true);
    setDevicesError('');

    try {
      const response = await fetch(
  `${API_URL}/devices?page=${devicesPage}&limit=50&search=${encodeURIComponent(deviceSearch)}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  },
);
const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível carregar os aparelhos.');
      }

      setDevices(Array.isArray(data.data) ? data.data : []);
setDevicesTotal(data.total ?? 0);
setDevicesTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setDevicesError(err instanceof Error ? err.message : 'Erro ao carregar aparelhos.');
    } finally {
      setDevicesLoading(false);
    }
  }

async function loadDashboardDevices() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  try {
    let page = 1;
    let totalPages = 1;
    const allDevices: Device[] = [];

    do {
      const response = await fetch(
        `${API_URL}/devices?page=${page}&limit=50&search=`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Não foi possível carregar os aparelhos do Dashboard.',
        );
      }

      if (Array.isArray(data.data)) {
        allDevices.push(...data.data);
      }

      totalPages = data.totalPages ?? 1;
      page++;
    } while (page <= totalPages);

    setDashboardDevices(allDevices);
  } catch (err) {
    console.error('Erro ao carregar aparelhos do Dashboard:', err);
  }
}

  function resetDeviceForm() {
    setEditingDeviceId(null);
    setDeviceCompanyId('');
    setDevicePhoneNumber('');
    setDeviceImei('');
    setDeviceManufacturer('');
    setDeviceModel('');
    setDeviceAndroidVersion('');
    setDeviceSimCarrier('');
    setDeviceConnectionType('UNKNOWN');
    setDeviceStatus('ACTIVE');
    setDeviceNotes('');
    setDeviceFormError('');
  }

  function editDevice(device: Device) {
    setEditingDeviceId(device.id);
    setDeviceCompanyId(device.companyId);
    setDevicePhoneNumber(device.phoneNumber || '');
    setDeviceImei(device.imei || '');
    setDeviceManufacturer(device.manufacturer || '');
    setDeviceModel(device.model || '');
    setDeviceAndroidVersion(device.androidVersion || '');
    setDeviceSimCarrier(device.simCarrier || '');
    setDeviceConnectionType(device.connectionType);
    setDeviceStatus(device.status);
    setDeviceNotes(device.notes || '');
    setDeviceFormError('');
    setShowDeviceForm(true);
    
    setTimeout(() => {
  document.getElementById('device-company')?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}, 100);
  }

  async function activateDeviceAgent(device: Device) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    setLoggedIn(false);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/devices/${device.id}/credential`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const credential = await response.json();

    const qrData = JSON.stringify({
  type: 'MIL_AGENT_ACTIVATION',
  deviceId: credential.deviceId,
  token: credential.token,
});

const qrCode = await QRCode.toDataURL(qrData);

const qrWindow = window.open('', '_blank');

if (qrWindow) {
  qrWindow.document.write(`
    <html>
      <head>
        <title>Ativação MIL Agent</title>
      </head>
      <body style="font-family:Arial;text-align:center;padding:30px;">
        <h2>MIL Operações</h2>
        <h3>Ativação do Aparelho</h3>
        <p>Escaneie este QR Code no MIL Agent</p>
        <img src="${qrCode}" width="320" height="320" />
        <p>Este QR contém a credencial de ativação do aparelho.</p>
      </body>
    </html>
  `);

  qrWindow.document.close();
}
  } catch (err) {
    window.alert(
      `Erro ao ativar Agent: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
    );
  }
}

  async function handleSaveDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeviceFormError('');
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoggedIn(false);
      return;
    }

    setDeviceFormLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/devices${editingDeviceId ? `/${editingDeviceId}` : ''}`,
        {
          method: editingDeviceId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            companyId: deviceCompanyId,
            phoneNumber: devicePhoneNumber.trim() || undefined,
            imei: deviceImei.trim() || undefined,
            manufacturer: deviceManufacturer.trim() || undefined,
            model: deviceModel.trim() || undefined,
            androidVersion: deviceAndroidVersion.trim() || undefined,
            simCarrier: deviceSimCarrier.trim() || undefined,
            connectionType: deviceConnectionType,
            status: deviceStatus,
            notes: deviceNotes.trim() || undefined,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        const validationMessage = Array.isArray(data.message) ? data.message.join(' ') : data.message;
        throw new Error(validationMessage || 'Não foi possível salvar o aparelho.');
      }

      resetDeviceForm();
      setShowDeviceForm(false);
      await loadDevices();
    } catch (err) {
      setDeviceFormError(err instanceof Error ? err.message : 'Erro ao salvar aparelho.');
    } finally {
      setDeviceFormLoading(false);
    }
  }

  function resetDriverForm() {
    setEditingDriverId(null);
    setDriverFullName('');
    setDriverCpf('');
    setDriverPhone('');
    setDriverEmail('');
    setDriverStatus('ACTIVE');
    setDriverNotes('');
    setDriverCompanyIds([]);
    setDriverFormError('');
  }

  function editDriver(driver: Driver) {
    setEditingDriverId(driver.id);
    setDriverFullName(driver.fullName);
    setDriverCpf(driver.cpf || '');
    setDriverPhone(driver.phone);
    setDriverEmail(driver.email || '');
    setDriverStatus(driver.status);
    setDriverNotes(driver.notes || '');
    setDriverCompanyIds(driver.driverCompanies.map(({ company }) => company.id));
    setDriverFormError('');
    setShowDriverForm(true);
  }

  async function handleSaveDriver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDriverFormError('');
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoggedIn(false);
      return;
    }

    setDriverFormLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/drivers${editingDriverId ? `/${editingDriverId}` : ''}`,
        {
          method: editingDriverId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: driverFullName.trim(),
            cpf: driverCpf.trim() || undefined,
            phone: driverPhone.trim(),
            email: driverEmail.trim() || undefined,
            status: driverStatus,
            notes: driverNotes.trim() || undefined,
            companyIds: driverCompanyIds,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        const validationMessage = Array.isArray(data.message)
          ? data.message.join(' ')
          : data.message;
        throw new Error(validationMessage || 'Não foi possível salvar o motorista.');
      }

      resetDriverForm();
      setShowDriverForm(false);
      await loadDrivers();
    } catch (err) {
      setDriverFormError(
        err instanceof Error ? err.message : 'Erro ao salvar motorista.',
      );
    } finally {
      setDriverFormLoading(false);
    }
  }

  function resetCompanyForm() {
    setCompanyName('');
    setCompanyLegalName('');
    setCompanyCapitalSocial('');
setCompanyTaxRegime('');
setCompanySize('');
setCompanyCnae('');
setCompanyBusinessActivity('');
    setCompanyDocument('');
    setCompanyDocumentType('CNPJ');
    setCompanyHolderId('');
    setHolderFullName('');
setHolderCpf('');
setHolderPhone('');
setHolderEmail('');
    setCompanyPhone('');
    setCompanyEmail('');
    setCompanyNotes('');
    setCompanyFormError('');
  }

function editCompany(company: Company) {
  setEditingCompanyId(company.id);
  setCompanyName(company.name || '');
  setCompanyLegalName(company.legalName || '');
  setCompanyDocument(company.document || '');
  setCompanyDocumentType(company.documentType || 'CNPJ');
  setCompanyHolderId(company.holderId || '');
  setCompanyPhone(company.phone || '');
  setCompanyEmail(company.email || '');
  setCompanyNotes(company.notes || '');
  setCompanyFormError('');
  setCompanyCapitalSocial(company.capitalSocial?.toString() || '');
setCompanyTaxRegime(company.taxRegime || '');
setCompanySize(company.companySize || '');
setCompanyCnae(company.cnae || '');
setCompanyBusinessActivity(company.businessActivity || '');
  setShowNewCompany(true);
}

  async function handleCreateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompanyFormError('');

    if (!companyName.trim() || !companyDocument.trim()) {
  setCompanyFormError(
    'Preencha o nome e o documento da empresa.',
  );
  return;
}

const hasValidDevice = companyDevices.some(
  (device) => device.phoneNumber.trim(),
);

if (!hasValidDevice) {
  setCompanyFormError(
    'Cadastre pelo menos um celular com número.',
  );
  return;
}

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoggedIn(false);
      return;
    }

    setCompanyFormLoading(true);

    try {

let holderId = companyHolderId;

if (!editingCompanyId) {
  if (!holderFullName.trim() || !holderCpf.trim()) {
    throw new Error('Preencha o nome e o CPF do titular.');
  }

  const holderResponse = await fetch(`${API_URL}/holders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fullName: holderFullName.trim(),
      cpf: holderCpf.trim(),
      phone: holderPhone.trim() || undefined,
      email: holderEmail.trim() || undefined,
    }),
  });

  const holderData = await holderResponse.json();

  if (!holderResponse.ok) {
    const message = Array.isArray(holderData.message)
      ? holderData.message.join(' ')
      : holderData.message;

    throw new Error(
      message || 'Não foi possível cadastrar o titular.',
    );
  }

  holderId = holderData.id;
}

      const response = await fetch(
  editingCompanyId
    ? `${API_URL}/companies/${editingCompanyId}`
    : `${API_URL}/companies`,
  {
    method: editingCompanyId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: companyName.trim(),
          legalName: companyLegalName.trim() || undefined,
          document: companyDocument.trim(),
          documentType: companyDocumentType,
          holderId: holderId,
          phone: companyPhone.trim() || undefined,
          email: holderEmail.trim() || undefined,
          capitalSocial: companyCapitalSocial ? Number(companyCapitalSocial) : undefined,
taxRegime: companyTaxRegime || undefined,
companySize: companySize || undefined,
cnae: companyCnae.trim() || undefined,
businessActivity: companyBusinessActivity.trim() || undefined,
          notes: companyNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sua sessão expirou. Faça login novamente.');
        }

        if (response.status === 403) {
          throw new Error('Você não tem permissão para cadastrar empresas.');
        }

        if (response.status === 400) {
          const validationMessage = Array.isArray(data.message)
            ? data.message.join(' ')
            : data.message;
          throw new Error(
            validationMessage || 'Revise os dados informados para a empresa.',
          );
        }

        throw new Error(data.message || 'Não foi possível cadastrar a empresa.');
      }

      const newCompanyId = editingCompanyId || data.id;

if (!newCompanyId) {
  throw new Error('A empresa foi criada, mas o sistema não retornou o ID.');
}

for (let index = 0; index < companyDevices.length; index += 1) {
  const device = companyDevices[index];

  const deviceResponse = await fetch(`${API_URL}/devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      companyId: newCompanyId,
      phoneNumber: device.phoneNumber.trim(),
      imei: device.imei.trim() || undefined,
      manufacturer: device.manufacturer.trim() || undefined,
      model: device.model.trim() || undefined,
      androidVersion: device.androidVersion.trim() || undefined,
      simCarrier: device.simCarrier.trim() || undefined,
      connectionType: device.connectionType,
      status: device.status,
      notes: device.notes.trim() || undefined,
    }),
  });

  const deviceData = await deviceResponse.json();

  if (!deviceResponse.ok) {
    const deviceMessage = Array.isArray(deviceData.message)
      ? deviceData.message.join(' ')
      : deviceData.message;

    throw new Error(
      `A empresa foi cadastrada, mas houve erro ao cadastrar o celular ${
        index + 1
      }: ${deviceMessage || 'verifique os dados do aparelho.'}`,
    );
  }
}

setCompaniesSuccess(
  companyDevices.length === 1
    ? 'Empresa e celular cadastrados com sucesso!'
    : `Empresa e ${companyDevices.length} celulares cadastrados com sucesso!`,
);

await loadCompanies();
await loadDevices();

setEditingCompanyId(null);
resetCompanyForm();
resetDeviceForm();

setShowNewCompany(false);
    } catch (err) {
      setCompanyFormError(
        err instanceof Error
          ? err.message
          : 'Erro ao cadastrar empresa.',
      );
    } finally {
      setCompanyFormLoading(false);
    }
  }

  useEffect(() => {
    if (showCompanies) {
      loadCompanies();
    }
  }, [showCompanies, companiesPage]);

  useEffect(() => {
  if (showPayments) {
    loadPaymentBeneficiaries();
    loadPayments();
  }
}, [showPayments]);

  useEffect(() => {
    if (showNewCompany) {
      loadHolders();
    }
  }, [showNewCompany]);

  useEffect(() => {
  if (showHolders) {
    console.log('ENTROU NO TITULARES - showHolders:', showHolders);
    loadHolders();
  }
}, [showHolders]);

  useEffect(() => {
    if (showDrivers) {
      loadDrivers();
      loadCompanies();
    }
  }, [showDrivers]);

  useEffect(() => {
    if (showDevices) {
      loadDevices();
      loadCompanies();
      loadDrivers();
    }
  }, [showDevices, devicesPage]);

  useEffect(() => {
  if (showUsers) {
    loadUsers();
  }
}, [showUsers]);

useEffect(() => {
  if (showPermissions) {
    loadRoles();
  }
}, [showPermissions]);

  useEffect(() => {
    if (showSms) {
      loadSms();
      loadCompanies();
      loadDrivers();
      loadDevices();
    }
  }, [showSms, smsCompanyFilter, smsDeviceFilter, smsDriverFilter, smsReadFilter, smsSearch]);

useEffect(() => {
  if (loggedIn) {
    loadCompanies();
    loadDashboardCompanies();
    loadDrivers();
    loadDevices();
    loadDashboardDevices();
    loadSms();
  }
}, [loggedIn]);;
  
  useEffect(() => {
    if (showMarketplaces) loadMarketplaces();
  }, [showMarketplaces, marketplaceCompanyFilter]);

  // LOGIN
  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand">
            <div className="brand-mark">MIL</div>

            <h1>Central de Operações</h1>

            <p>Gestão inteligente, segura e integrada.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">E-mail</label>

            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Senha</label>

            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-footer">
            Central de Operações • MIL Gestão & Tecnologia
          </div>
        </div>
      </div>
    );
  }
  // NOVA EMPRESA
  if (showNewCompany) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <div className="dashboard-logo">MIL</div>

            <div>
              <h1>Central de Operações</h1>
              <span>Nova Empresa</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={() => {
              resetCompanyForm();
              setShowNewCompany(false);
            }}
          >
            ← Voltar
          </button>
        </header>

        <main className="dashboard-content">
          <section className="welcome-card">
            <span className="badge">CADASTRO</span>

            <h2>Nova Empresa</h2>

            <p>
              Cadastre uma nova empresa na Central de Operações.
            </p>
          </section>

          <section className="welcome-card">
            <form onSubmit={handleCreateCompany}>
              <h3>🏢 Pessoa Jurídica</h3>
              <label htmlFor="company-name">Nome da empresa *</label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                required
              />

              <label htmlFor="company-legal-name">Razão social</label>
              <input
                id="company-legal-name"
                type="text"
                value={companyLegalName}
                onChange={(event) => setCompanyLegalName(event.target.value)}
              />

              <label htmlFor="company-capital-social">Capital Social</label>
<input
  id="company-capital-social"
  type="number"
  step="0.01"
  min="0"
  value={companyCapitalSocial}
  onChange={(event) => setCompanyCapitalSocial(event.target.value)}
  placeholder="Ex.: 500000,00"
/>

<label htmlFor="company-tax-regime">Regime Tributário</label>
<select
  id="company-tax-regime"
  value={companyTaxRegime}
  onChange={(event) => setCompanyTaxRegime(event.target.value)}
>
  <option value="">Selecione</option>
  <option value="Simples Nacional">Simples Nacional</option>
  <option value="Lucro Presumido">Lucro Presumido</option>
  <option value="Lucro Real">Lucro Real</option>
  <option value="MEI">MEI</option>
</select>

<label htmlFor="company-size">Porte da Empresa</label>
<select
  id="company-size"
  value={companySize}
  onChange={(event) => setCompanySize(event.target.value)}
>
  <option value="">Selecione</option>
  <option value="MEI">MEI</option>
  <option value="ME">Microempresa (ME)</option>
  <option value="EPP">Empresa de Pequeno Porte (EPP)</option>
  <option value="MEDIO">Médio Porte</option>
  <option value="GRANDE">Grande Porte</option>
</select>

<label htmlFor="company-cnae">CNAE</label>
<input
  id="company-cnae"
  type="text"
  value={companyCnae}
  onChange={(event) => setCompanyCnae(event.target.value)}
  placeholder="Ex.: 47.89-0-99"
/>

<label htmlFor="company-business-activity">Atividade da Empresa</label>
<input
  id="company-business-activity"
  type="text"
  value={companyBusinessActivity}
  onChange={(event) => setCompanyBusinessActivity(event.target.value)}
  placeholder="Ex.: Comércio varejista de variedades"
/>

              <label htmlFor="company-document">Documento *</label>
              <input
                id="company-document"
                type="text"
                value={companyDocument}
                onChange={(event) => setCompanyDocument(event.target.value)}
                required
              />

              <label htmlFor="company-document-type">Tipo de documento *</label>
              <select
                id="company-document-type"
                value={companyDocumentType}
                onChange={(event) => setCompanyDocumentType(event.target.value)}
                required
              >
                <option value="CNPJ">CNPJ</option>
                <option value="CPF">CPF</option>
              </select>

<h3>👤 Pessoa Física</h3>
              <label htmlFor="company-holder-name">Nome do titular *</label>
<input
  id="company-holder-name"
  type="text"
  value={holderFullName}
  onChange={(event) => setHolderFullName(event.target.value)}
  required
/>

<label htmlFor="company-holder-cpf">CPF do titular *</label>
<input
  id="company-holder-cpf"
  type="text"
  value={holderCpf}
  onChange={(event) => setHolderCpf(event.target.value)}
  required
/>


<label htmlFor="company-holder-email">E-mail do titular</label>
<input
  id="company-holder-email"
  type="email"
  value={holderEmail}
  onChange={(event) => setHolderEmail(event.target.value)}
/>

              <label htmlFor="company-phone">Telefone</label>
              <input
                id="company-phone"
                type="tel"
                value={companyPhone}
                onChange={(event) => setCompanyPhone(event.target.value)}
              />

             
              <label htmlFor="company-notes">Observações</label>
              <textarea
                id="company-notes"
                value={companyNotes}
                onChange={(event) => setCompanyNotes(event.target.value)}
                rows={4}
              />
<hr />

<h3>Dados dos Celulares</h3>

{companyDevices.map((device, index) => (
  <div key={index} className="company-device-block">
    <div className="company-device-header">
      <strong>Celular {index + 1}</strong>

      {companyDevices.length > 1 && (
        <button
          type="button"
          onClick={() => removeCompanyDevice(index)}
        >
          Remover celular
        </button>
      )}
    </div>

    <label htmlFor={`company-device-phone-${index}`}>
      Número do celular *
    </label>
    <input
      id={`company-device-phone-${index}`}
      type="tel"
      value={device.phoneNumber}
      onChange={(event) =>
        updateCompanyDevice(index, 'phoneNumber', event.target.value)
      }
      required
    />

    <label htmlFor={`company-device-imei-${index}`}>
      IMEI ou identificador
    </label>
    <input
      id={`company-device-imei-${index}`}
      type="text"
      value={device.imei}
      onChange={(event) =>
        updateCompanyDevice(index, 'imei', event.target.value)
      }
    />

    <label htmlFor={`company-device-manufacturer-${index}`}>
      Fabricante
    </label>
    <input
      id={`company-device-manufacturer-${index}`}
      type="text"
      value={device.manufacturer}
      onChange={(event) =>
        updateCompanyDevice(index, 'manufacturer', event.target.value)
      }
    />

    <label htmlFor={`company-device-model-${index}`}>
      Modelo
    </label>
    <input
      id={`company-device-model-${index}`}
      type="text"
      value={device.model}
      onChange={(event) =>
        updateCompanyDevice(index, 'model', event.target.value)
      }
    />

    <label htmlFor={`company-device-android-${index}`}>
      Versão Android
    </label>
    <input
      id={`company-device-android-${index}`}
      type="text"
      value={device.androidVersion}
      onChange={(event) =>
        updateCompanyDevice(index, 'androidVersion', event.target.value)
      }
    />

    <label htmlFor={`company-device-carrier-${index}`}>
      Operadora
    </label>
    <input
      id={`company-device-carrier-${index}`}
      type="text"
      value={device.simCarrier}
      onChange={(event) =>
        updateCompanyDevice(index, 'simCarrier', event.target.value)
      }
    />

    <label htmlFor={`company-device-connection-${index}`}>
      Tipo de conexão
    </label>
    <select
      id={`company-device-connection-${index}`}
      value={device.connectionType}
      onChange={(event) =>
        updateCompanyDevice(index, 'connectionType', event.target.value)
      }
    >
      <option value="UNKNOWN">Desconhecida</option>
      <option value="WIFI">Wi-Fi</option>
      <option value="MOBILE">Móvel</option>
    </select>

    <label htmlFor={`company-device-status-${index}`}>
      Status do aparelho
    </label>
    <select
      id={`company-device-status-${index}`}
      value={device.status}
      onChange={(event) =>
        updateCompanyDevice(index, 'status', event.target.value)
      }
    >
      <option value="ACTIVE">Ativo</option>
      <option value="INACTIVE">Inativo</option>
      <option value="BLOCKED">Bloqueado</option>
    </select>

    <label htmlFor={`company-device-notes-${index}`}>
      Observações do celular
    </label>
    <textarea
      id={`company-device-notes-${index}`}
      value={device.notes}
      onChange={(event) =>
        updateCompanyDevice(index, 'notes', event.target.value)
      }
      rows={3}
    />
  </div>
))}

<button
  type="button"
  onClick={addCompanyDevice}
>
  + Adicionar outro celular
</button>

         {companyFormError && (
                <div className="error-message">{companyFormError}</div>
              )}

              <button type="submit" disabled={companyFormLoading || holdersLoading}>
                {companyFormLoading ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  // CENTRAL DE MARKETPLACES
  if (showMarketplaces) {
    const filteredAccounts = marketplaceAccounts.filter((account) =>
      (!marketplaceFilter || account.marketplaceId === marketplaceFilter) &&
      (!marketplaceStatusFilter || account.status === marketplaceStatusFilter),
    );
    const countStatus = (status: MarketplaceAccount['status']) => filteredAccounts.filter((account) => account.status === status).length;
    const problems = filteredAccounts.filter((account) => ['DISCONNECTED', 'BLOCKED', 'ERROR'].includes(account.status)).length;
    
    return (
      <div className="dashboard-page">
        <header className="dashboard-header"><div><div className="dashboard-logo">MIL</div><div><h1>Central de Operações</h1><span>Status de Marketplaces</span></div></div><button className="logout-button" onClick={() => setShowMarketplaces(false)}>← Início</button></header>
        <main className="dashboard-content">
          <section className="welcome-card"><span className="badge">OPERAÇÃO</span><h2>Marketplaces</h2><p>Aptidão operacional por empresa e canal.</p></section>
          <section className="device-metrics">
            <div><strong>{countStatus('ACTIVE')}</strong><span>Contas ativas</span></div>
            <div><strong>{countStatus('PENDING')}</strong><span>Pendentes</span></div>
            <div><strong>{countStatus('DISCONNECTED')}</strong><span>Desconectadas</span></div>
            <div><strong>{countStatus('BLOCKED')}</strong><span>Bloqueadas</span></div>
            <div><strong>{countStatus('ERROR')}</strong><span>Com erro</span></div>
            <div><strong>{problems}</strong><span>Problemas operacionais</span></div>
          </section>
          <section className="welcome-card sms-filters">
  <div className="sms-filter-field">
    <label htmlFor="marketplace-company-filter">Empresa</label>
    <select
      id="marketplace-company-filter"
      value={marketplaceCompanyFilter}
      onChange={(event) => setMarketplaceCompanyFilter(event.target.value)}
    >
      <option value="">Todas</option>
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  </div>

  <div className="sms-filter-field">
    <label htmlFor="marketplace-filter">Marketplace</label>
    <select
      id="marketplace-filter"
      value={marketplaceFilter}
      onChange={(event) => setMarketplaceFilter(event.target.value)}
    >
      <option value="">Todos</option>
      {marketplaces.map((marketplace) => (
        <option key={marketplace.id} value={marketplace.id}>
          {marketplace.name}
        </option>
      ))}
    </select>
  </div>

  <div className="sms-filter-field">
    <label htmlFor="marketplace-status-filter">Status</label>
    <select
      id="marketplace-status-filter"
      value={marketplaceStatusFilter}
      onChange={(event) => setMarketplaceStatusFilter(event.target.value)}
    >
      <option value="">Todos</option>
      <option value="ACTIVE">Ativo</option>
      <option value="PENDING">Pendente</option>
      <option value="DISCONNECTED">Desconectado</option>
      <option value="BLOCKED">Bloqueado</option>
      <option value="ERROR">Erro</option>
    </select>
  </div>
</section>
          {marketplaceLoading && <section className="welcome-card"><p>Carregando marketplaces...</p></section>}
          {marketplaceError && <section className="welcome-card"><div className="error-message">{marketplaceError}</div></section>}
          {!marketplaceLoading && !marketplaceError && Array.from(new Set(filteredAccounts.map((account) => account.companyId))).map((companyId) => {
            const companyAccounts = filteredAccounts.filter((account) => account.companyId === companyId);
            return <section className="welcome-card marketplace-company-card" key={companyId}><h3>{companyAccounts[0]?.company.name}</h3><div className="marketplace-grid">{(
  marketplaceFilter
    ? marketplaces.filter((marketplace) => marketplace.id === marketplaceFilter)
    : marketplaces
).map((marketplace) => { const account = companyAccounts.find((item) => item.marketplaceId === marketplace.id); return <div className="marketplace-cell" key={marketplace.id}><strong>{marketplace.name}</strong><span className={`marketplace-status marketplace-${(account?.status || 'INACTIVE').toLowerCase()}`}>{account?.status || 'INACTIVE'}</span>{account && <select value={account.status} onChange={(event) => updateMarketplaceAccount(account, event.target.value as MarketplaceAccount['status'])}>{marketplaceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>}</div>; })}</div></section>;
          })}
        </main>
      </div>
    );
  }

  // CENTRAL DE SMS
  if (showSms) {
    const today = new Date().toDateString();
    const unread = smsMessages.filter((sms) => !sms.readAt).length;
    const receivedToday = smsMessages.filter((sms) => new Date(sms.receivedAt).toDateString() === today).length;
    const devicesWithSms = new Set(smsMessages.map((sms) => sms.device?.id)).size;

    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <div className="dashboard-logo">MIL</div>
            <div>
              <h1>Central de Operações</h1>
              <span>Central de SMS</span>
            </div>
          </div>
          <button className="logout-button" onClick={() => setShowSms(false)}>← Início</button>
        </header>

        <main className="dashboard-content">
          <section className="welcome-card">
            <div className="companies-title">
              <div>
                <span className="badge">COMUNICAÇÃO</span>
                <h2>SMS</h2>
                <p>Mensagens recebidas pelos aparelhos monitorados.</p>
              </div>
            </div>
          </section>

          <section className="device-metrics">
            <div><strong>{smsMessages.length}</strong><span>Total de SMS</span></div>
            <div><strong>{unread}</strong><span>Não lidos</span></div>
            <div><strong>{receivedToday}</strong><span>Recebidos hoje</span></div>
            <div><strong>{devicesWithSms}</strong><span>Aparelhos com SMS</span></div>
          </section>

          <section className="welcome-card sms-filters">
  <div className="sms-filter-field">
    <label htmlFor="sms-company-filter">Empresa</label>
    <select
      id="sms-company-filter"
      value={smsCompanyFilter}
      onChange={(event) => setSmsCompanyFilter(event.target.value)}
    >
      <option value="">Todas</option>
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  </div>

  <div className="sms-filter-field">
    <label htmlFor="sms-device-filter">Aparelho</label>
    <select
      id="sms-device-filter"
      value={smsDeviceFilter}
      onChange={(event) => setSmsDeviceFilter(event.target.value)}
    >
      <option value="">Todos</option>
      {devices.map((device) => (
        <option key={device.id} value={device.id}>
          {device.model || device.phoneNumber || device.imei}
        </option>
      ))}
    </select>
  </div>

  <div className="sms-filter-field">
    <label htmlFor="sms-driver-filter">Motorista</label>
    <select
      id="sms-driver-filter"
      value={smsDriverFilter}
      onChange={(event) => setSmsDriverFilter(event.target.value)}
    >
      <option value="">Todos</option>
      {drivers.map((driver) => (
        <option key={driver.id} value={driver.id}>
          {driver.fullName}
        </option>
      ))}
    </select>
  </div>

  <div className="sms-filter-field">
    <label htmlFor="sms-read-filter">Leitura</label>
    <select
      id="sms-read-filter"
      value={smsReadFilter}
      onChange={(event) => setSmsReadFilter(event.target.value)}
    >
      <option value="">Todos</option>
      <option value="false">Não lidos</option>
      <option value="true">Lidos</option>
    </select>
  </div>

  <div className="sms-filter-field">
    <label htmlFor="sms-search">Buscar</label>
    <input
      id="sms-search"
      value={smsSearch}
      onChange={(event) => setSmsSearch(event.target.value)}
      placeholder="Remetente ou mensagem"
    />
  </div>
</section>

          {smsLoading && <section className="welcome-card"><p>Carregando SMS...</p></section>}
          {smsError && <section className="welcome-card"><div className="error-message">{smsError}</div></section>}
          {!smsLoading && !smsError && smsMessages.length === 0 && <section className="welcome-card"><p>Nenhum SMS encontrado.</p></section>}
          {!smsLoading && !smsError && smsMessages.length > 0 && (
            <section className="companies-list">
              {smsMessages.map((sms) => (
                <div className="company-row sms-row" key={sms.id}>
                  <div>
                    <strong>{sms.sender}</strong>
                    <span>{sms.message}</span>
                    <span>Empresa: {sms.device?.company?.name || 'Não informada'} • Aparelho: {sms.device?.phoneNumber || 'Não informado'}</span>
                    <span>{new Date(sms.receivedAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="device-row-meta">
                    <span className={sms.readAt ? 'device-online' : 'device-offline'}>{sms.readAt ? 'LIDO' : 'NÃO LIDO'}</span>
                    {!sms.readAt && <button className="new-company-button" onClick={() => markSmsAsRead(sms.id)}>Marcar como lido</button>}
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    );
  }

  // TELA DE APARELHOS
  if (showDevices) {
    const onlineDevices = dashboardDevices.filter((device) => device.currentStatus?.isOnline).length;
    const criticalDevices = dashboardDevices.filter((device) => device.batterySurvivalStatus === 'CRITICAL').length;
    const emergencyDevices = dashboardDevices.filter((device) => device.batterySurvivalStatus === 'EMERGENCY').length;
    const staleLocationDevices = dashboardDevices.filter(isLocationStale).length;

    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <div className="dashboard-logo">MIL</div>
            <div>
              <h1>Central de Operações</h1>
              <span>Gestão de Aparelhos</span>
            </div>
          </div>
          <button
            className="logout-button"
            onClick={() => {
              resetDeviceForm();
              setShowDeviceForm(false);
              setShowDevices(false);
            }}
          >
            ← Início
          </button>
        </header>

        <main className="dashboard-content">
          <section className="welcome-card">
            <div className="companies-title">
              <div>
                <span className="badge">OPERAÇÃO</span>
                <h2>Aparelhos</h2>
                <p>Monitore conectividade e sobrevivência da bateria.</p>
              </div>
              <button
                className="new-company-button"
                onClick={() => {
                  resetDeviceForm();
                  setShowDeviceForm(true);
                }}
              >
                + Novo Aparelho
              </button>
            </div>
          </section>
          
          <section className="welcome-card companies-search">
  <form
    onSubmit={(event) => {
      event.preventDefault();
      if (devicesPage !== 1) {
  setDevicesPage(1);
} else {
  loadDevices();
}
    }}
  >
    <input
      type="text"
      value={deviceSearch}
      onChange={(event) => setDeviceSearch(event.target.value)}
      placeholder="Buscar por número, IMEI, modelo, fabricante ou empresa"
    />
    <button type="submit">Buscar</button>
  </form>
</section>

          <section className="device-metrics">
            <div><strong>{devicesTotal}</strong><span>Total de aparelhos</span></div>
            <div><strong>{onlineDevices}</strong><span>Online</span></div>
            <div><strong>{devicesTotal - onlineDevices}</strong><span>Offline</span></div>
            <div><strong>{criticalDevices}</strong><span>Bateria crítica</span></div>
            <div><strong>{emergencyDevices}</strong><span>Emergência</span></div>
            <div><strong>{staleLocationDevices}</strong><span>Sem localização recente</span></div>
          </section>

          {showDeviceForm && (
            <section className="welcome-card">
              <h3>{editingDeviceId ? 'Editar aparelho' : 'Novo aparelho'}</h3>
              <form onSubmit={handleSaveDevice}>
                <label htmlFor="device-company">Empresa *</label>
                <select id="device-company" value={deviceCompanyId} onChange={(event) => setDeviceCompanyId(event.target.value)} required>
                  <option value="">Selecione uma empresa</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>

                <label htmlFor="device-phone">Número do celular</label>
                <input id="device-phone" value={devicePhoneNumber} onChange={(event) => setDevicePhoneNumber(event.target.value)} />
                <label htmlFor="device-imei">IMEI ou identificador</label>
                <input id="device-imei" value={deviceImei} onChange={(event) => setDeviceImei(event.target.value)} />
                <label htmlFor="device-manufacturer">Fabricante</label>
                <input id="device-manufacturer" value={deviceManufacturer} onChange={(event) => setDeviceManufacturer(event.target.value)} />
                <label htmlFor="device-model">Modelo</label>
                <input id="device-model" value={deviceModel} onChange={(event) => setDeviceModel(event.target.value)} />
                <label htmlFor="device-android">Versão Android</label>
                <input id="device-android" value={deviceAndroidVersion} onChange={(event) => setDeviceAndroidVersion(event.target.value)} />
                <label htmlFor="device-carrier">Operadora</label>
                <input id="device-carrier" value={deviceSimCarrier} onChange={(event) => setDeviceSimCarrier(event.target.value)} />

                <label htmlFor="device-connection">Tipo de conexão</label>
                <select id="device-connection" value={deviceConnectionType} onChange={(event) => setDeviceConnectionType(event.target.value as 'WIFI' | 'MOBILE' | 'UNKNOWN')}>
                  <option value="UNKNOWN">Desconhecida</option>
                  <option value="WIFI">Wi-Fi</option>
                  <option value="MOBILE">Móvel</option>
                </select>
                <label htmlFor="device-status">Status operacional</label>
                <select id="device-status" value={deviceStatus} onChange={(event) => setDeviceStatus(event.target.value as 'ACTIVE' | 'INACTIVE' | 'BLOCKED')}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
                <label htmlFor="device-notes">Observações</label>
                <textarea id="device-notes" value={deviceNotes} onChange={(event) => setDeviceNotes(event.target.value)} rows={4} />
                {deviceFormError && <div className="error-message">{deviceFormError}</div>}
                <button type="submit" disabled={deviceFormLoading}>{deviceFormLoading ? 'Salvando...' : 'Salvar Aparelho'}</button>
                <button type="button" className="logout-button" onClick={() => { resetDeviceForm(); setShowDeviceForm(false); }}>Cancelar</button>
              </form>
            </section>
          )}

          {devicesLoading && <section className="welcome-card"><p>Carregando aparelhos...</p></section>}
          {devicesError && <section className="welcome-card"><div className="error-message">{devicesError}</div></section>}
          {!devicesLoading && !devicesError && devices.length === 0 && <section className="welcome-card"><p>Nenhum aparelho cadastrado.</p></section>}
          {!devicesLoading && !devicesError && devices.length > 0 && (
            <section className="companies-list device-list">
              {devices.map((device) => {
                const currentStatus = device.currentStatus;
                const battery = currentStatus?.batteryLevel;
                return (
                  <div className="company-row device-row" key={device.id}>
                    <div>
                      <strong>{device.model || device.manufacturer || 'Aparelho sem modelo'}</strong>
                      <span>{device.phoneNumber || device.imei || 'Identificador não informado'}</span>
                      <span>Empresa: {device.company?.name || 'Não vinculada'}</span>
                      <span>Última comunicação: {currentStatus?.lastSeenAt ? new Date(currentStatus.lastSeenAt).toLocaleString('pt-BR') : 'Nunca'}</span>
                      <span>
                        Localização: {currentStatus?.lastLatitude !== null && currentStatus?.lastLatitude !== undefined && currentStatus?.lastLongitude !== null && currentStatus?.lastLongitude !== undefined
                          ? `${currentStatus.lastLatitude}, ${currentStatus.lastLongitude}`
                          : 'Não disponível'}
                        {' • '}
                        {currentStatus?.lastLocationAt ? new Date(currentStatus.lastLocationAt).toLocaleString('pt-BR') : 'Nunca'}
                      </span>
                      <span>
                        SMS: {device._count?.smsMessages ?? 0}
                        {device.smsMessages?.[0] ? ` • Último: ${device.smsMessages[0].sender} - ${device.smsMessages[0].message}` : ''}
                      </span>
                    </div>
                    <div className="device-row-meta">
                      <span className={currentStatus?.isOnline ? 'device-online' : 'device-offline'}>{currentStatus?.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                      <span>{battery ?? '--'}% {currentStatus?.isCharging ? '• Carregando' : ''}</span>
                      <span className={`battery-${device.batterySurvivalStatus.toLowerCase()}`}>{device.batterySurvivalStatus}</span>
                      <span className={isLocationStale(device) ? 'device-offline' : 'device-online'}>
                        {isLocationStale(device) ? 'LOCALIZAÇÃO DESATUALIZADA' : 'LOCALIZAÇÃO ATUALIZADA'}
                      </span>
                      <button
                        className="new-company-button"
                        onClick={() => openDeviceLocation(device)}
                        >
                        Ver localização
                      </button>
                      <button
                        className="new-company-button"
                        onClick={() => {
                          setSmsDeviceFilter(device.id);
                          setShowSms(true);
                        }}
                      >
                        Ver SMS
                      </button>

<button
  className="new-company-button"
  onClick={() => activateDeviceAgent(device)}
>
  Ativar Agent
</button>

                      <button className="new-company-button" onClick={() => editDevice(device)}>Editar</button>
                    </div>
                  </div>
                );
              })}
              <section className="companies-pagination">
  <span>
    Total: {devicesTotal} aparelhos
  </span>


  <div>
    <button
      type="button"
      disabled={devicesPage <= 1}
      onClick={() => setDevicesPage((page) => Math.max(1, page - 1))}
    >
      Anterior
    </button>

    <span>
      Página {devicesPage} de {devicesTotalPages}
    </span>

    <button
      type="button"
      disabled={devicesPage >= devicesTotalPages}
      onClick={() =>
        setDevicesPage((page) =>
          Math.min(devicesTotalPages, page + 1),
        )
      }
    >
      Próxima
    </button>
  </div>
</section>
            </section>
          )}
        </main>
      </div>
    );
  }

  // TELA DE USUÁRIOS
if (showUsers) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-logo">MIL</div>
          <div>
            <h1>Central de Operações</h1>
            <span>Gestão de Usuários</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={() => setShowUsers(false)}
        >
          ← Início
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-card">
  <div className="companies-title">
    <div>
      <span className="badge">ACESSOS</span>
      <h2>Usuários</h2>
      <p>Consulte os usuários e perfis de acesso da plataforma.</p>
    </div>

    <button
      className="primary-button"
      onClick={() => setShowCreateUser(true)}
    >
      + Novo Usuário
    </button>
  </div>
</section>

{showCreateUser && (
  <section className="welcome-card">
    <div className="companies-title">
      <div>
        <span className="badge">NOVO ACESSO</span>
        <h2>Cadastrar Novo Usuário</h2>
        <p>Crie o acesso do cliente à Central de Operações.</p>
      </div>
    </div>

    {newUserError && (
      <div className="error-message">
        {newUserError}
      </div>
    )}

    <div className="form-grid">
      <label>
        Nome
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="Nome do usuário"
        />
      </label>

      <label>
        E-mail
        <input
          type="email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          placeholder="cliente@empresa.com.br"
        />
      </label>

      <label>
        Senha inicial
        <input
          type="password"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />
      </label>

      <label>
        Perfil de acesso
        <select
          value={newUserRole}
          onChange={(e) => setNewUserRole(e.target.value)}
        >
          <option value="GESTOR">Gestor / Administrador do Cliente</option>
          <option value="OPERADOR">Operador</option>
        </select>
      </label>
    </div>

    <div className="form-actions">
      <button
        type="button"
        className="primary-button"
        onClick={createUser}
      >
        Cadastrar Usuário
      </button>

      <button
        type="button"
        className="logout-button"
        onClick={() => {
          setShowCreateUser(false);
          setNewUserError('');
        }}
      >
        Cancelar
      </button>
    </div>
  </section>
)}

        {usersLoading && (
          <section className="welcome-card">
            <p>Carregando usuários...</p>
          </section>
        )}

        {usersError && (
          <section className="welcome-card">
            <div className="error-message">
              {usersError}
            </div>
          </section>
        )}

        {!usersLoading && !usersError && users.length === 0 && (
          <section className="welcome-card">
            <p>Nenhum usuário cadastrado.</p>
          </section>
        )}

        {!usersLoading && !usersError && users.length > 0 && (
          <section className="companies-list">
            {users.map((user) => (
              <div className="company-row" key={user.id}>
                <div>
                  <strong>{user.name || 'Usuário sem nome'}</strong>
                  <span>{user.email}</span>
                  <span>
                    Perfil:{' '}
                    {user.userRoles
                      ?.map((item: any) => item.role?.name)
                      .filter(Boolean)
                      .join(', ') || 'Sem perfil'}
                  </span>
                  <span>
                    Último acesso:{' '}
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('pt-BR')
                      : 'Nunca acessou'}
                  </span>
                </div>

                <span className="status-badge">
                  {user.status || 'SEM STATUS'}
                </span>

                {user.status === 'ACTIVE' &&
  !user.userRoles?.some(
    (item: any) => item.role?.name === 'SUPER_ADMIN'
  ) && (
  <button
    type="button"
    onClick={() => handleDeactivateUser(user.id, user.name)}
  >
    Desativar
  </button>
)}

{user.status === 'INACTIVE' && (
  <button
    type="button"
    onClick={() => handleActivateUser(user.id, user.name)}
  >
    Reativar
  </button>
)}

              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

// TELA DE PERMISSÕES
if (showPermissions) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-logo">MIL</div>
          <div>
            <h1>Central de Operações</h1>
            <span>Gestão de Permissões</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={() => setShowPermissions(false)}
        >
          ← Início
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-card">
          <div className="companies-title">
            <div>
              <span className="badge">ACESSOS</span>
              <h2>Permissões</h2>
              <p>Consulte os perfis e permissões de acesso da plataforma.</p>
            </div>
          </div>
        </section>

        {rolesLoading && (
          <section className="welcome-card">
            <p>Carregando permissões...</p>
          </section>
        )}

        {rolesError && (
          <section className="welcome-card">
            <div className="error-message">
              {rolesError}
            </div>
          </section>
        )}

        {!rolesLoading && !rolesError && roles.length === 0 && (
          <section className="welcome-card">
            <p>Nenhum perfil de acesso cadastrado.</p>
          </section>
        )}

        {!rolesLoading && !rolesError && roles.length > 0 && (
          <section className="companies-list">
            {roles.map((role) => (
              <div className="company-row" key={role.id}>
                <div>
                  <strong>{role.name}</strong>
                  <span>
                    {role.description || 'Sem descrição'}
                  </span>
                  <span>
                    Permissões:{' '}
                    {role.rolePermissions
                      ?.map((item: any) => item.permission?.code)
                      .filter(Boolean)
                      .join(', ') || 'Nenhuma permissão'}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

// TELA DE TITULARES
if (showHolders) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-logo">MIL</div>
          <div>
            <h1>Central de Operações</h1>
            <span>Gestão de Titulares</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={() => setShowHolders(false)}
        >
          ← Início
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-card">
          <div className="companies-title">
            <div>
              <span className="badge">CADASTROS</span>
              <h2>Titulares</h2>
              <p>Consulte os titulares cadastrados na plataforma.</p>
            </div>
          </div>
        </section>

        <section className="welcome-card">
  <button
    type="button"
    className="new-company-button"
    onClick={() => {
      setHolderFormError('');
      setShowHolderForm(!showHolderForm);
    }}
  >
    {showHolderForm ? 'Cancelar' : '+ Novo Titular'}
  </button>

  {showHolderForm && (
    <form onSubmit={handleCreateHolder} style={{ marginTop: '20px' }}>
      <div className="form-grid">
        <div>
          <label htmlFor="holder-full-name">Nome completo *</label>
          <input
            id="holder-full-name"
            type="text"
            value={holderFullName}
            onChange={(event) => setHolderFullName(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="holder-cpf">CPF *</label>
          <input
            id="holder-cpf"
            type="text"
            value={holderCpf}
            onChange={(event) => setHolderCpf(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="holder-phone">Telefone</label>
          <input
            id="holder-phone"
            type="tel"
            value={holderPhone}
            onChange={(event) => setHolderPhone(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="holder-email">E-mail</label>
          <input
            id="holder-email"
            type="email"
            value={holderEmail}
            onChange={(event) => setHolderEmail(event.target.value)}
          />
        </div>
      </div>

      {holderFormError && (
        <p className="form-error">{holderFormError}</p>
      )}

      <button
        type="submit"
        className="new-company-button"
        disabled={holderFormLoading}
        style={{ marginTop: '16px' }}
      >
        {holderFormLoading ? 'Cadastrando...' : 'Cadastrar Titular'}
      </button>
    </form>
  )}
</section>

        {holdersLoading && (
          <section className="welcome-card">
            <p>Carregando titulares...</p>
          </section>
        )}

        {!holdersLoading && holders.length === 0 && (
          <section className="welcome-card">
            <p>Nenhum titular cadastrado.</p>
          </section>
        )}

        {!holdersLoading && holders.length > 0 && (
          <section className="companies-list">
            {holders.map((holder) => (
              <div className="company-row" key={holder.id}>
                <div>
                  <strong>{holder.fullName || 'Titular sem nome'}</strong>
                  <span>{holder.cpf || 'CPF não informado'}</span>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
  
  // TELA DE MOTORISTAS
  if (showDrivers) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <div className="dashboard-logo">MIL</div>
            <div>
              <h1>Central de Operações</h1>
              <span>Gestão de Motoristas</span>
            </div>
          </div>
          <button
            className="logout-button"
            onClick={() => {
              resetDriverForm();
              setShowDriverForm(false);
              setShowDrivers(false);
            }}
          >
            ← Início
          </button>
        </header>

        <main className="dashboard-content">
          <section className="welcome-card">
            <div className="companies-title">
              <div>
                <span className="badge">OPERAÇÃO</span>
                <h2>Motoristas</h2>
                <p>Cadastre e acompanhe os agentes responsáveis pelas operações.</p>
              </div>
              <button
                className="new-company-button"
                onClick={() => {
                  resetDriverForm();
                  setShowDriverForm(true);
                }}
              >
                + Novo Motorista
              </button>
            </div>
          </section>

          {showDriverForm && (
            <section className="welcome-card">
              <h3>{editingDriverId ? 'Editar motorista' : 'Novo motorista'}</h3>
              <form onSubmit={handleSaveDriver}>
                <label htmlFor="driver-full-name">Nome completo *</label>
                <input
                  id="driver-full-name"
                  value={driverFullName}
                  onChange={(event) => setDriverFullName(event.target.value)}
                  required
                />

                <label htmlFor="driver-cpf">CPF</label>
                <input
                  id="driver-cpf"
                  value={driverCpf}
                  onChange={(event) => setDriverCpf(event.target.value)}
                />

                <label htmlFor="driver-phone">Telefone *</label>
                <input
                  id="driver-phone"
                  type="tel"
                  value={driverPhone}
                  onChange={(event) => setDriverPhone(event.target.value)}
                  required
                />

                <label htmlFor="driver-email">E-mail</label>
                <input
                  id="driver-email"
                  type="email"
                  value={driverEmail}
                  onChange={(event) => setDriverEmail(event.target.value)}
                />

                <label htmlFor="driver-status">Status</label>
                <select
                  id="driver-status"
                  value={driverStatus}
                  onChange={(event) => setDriverStatus(event.target.value as 'ACTIVE' | 'INACTIVE')}
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>

                <label htmlFor="driver-companies">Empresas vinculadas</label>
                <select
                  id="driver-companies"
                  multiple
                  value={driverCompanyIds}
                  onChange={(event) =>
                    setDriverCompanyIds(
                      Array.from(event.target.selectedOptions, (option) => option.value),
                    )
                  }
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>

                <label htmlFor="driver-notes">Observações</label>
                <textarea
                  id="driver-notes"
                  value={driverNotes}
                  onChange={(event) => setDriverNotes(event.target.value)}
                  rows={4}
                />

                {driverFormError && <div className="error-message">{driverFormError}</div>}

                <button type="submit" disabled={driverFormLoading}>
                  {driverFormLoading ? 'Salvando...' : 'Salvar Motorista'}
                </button>
                <button
                  type="button"
                  className="logout-button"
                  onClick={() => {
                    resetDriverForm();
                    setShowDriverForm(false);
                  }}
                >
                  Cancelar
                </button>
              </form>
            </section>
          )}

          {driversLoading && <section className="welcome-card"><p>Carregando motoristas...</p></section>}
          {driversError && <section className="welcome-card"><div className="error-message">{driversError}</div></section>}
          {!driversLoading && !driversError && drivers.length === 0 && (
            <section className="welcome-card"><p>Nenhum motorista cadastrado.</p></section>
          )}
          {!driversLoading && !driversError && drivers.length > 0 && (
            <section className="companies-list">
              {drivers.map((driver) => (
                <div className="company-row" key={driver.id}>
                  <div>
                    <strong>{driver.fullName}</strong>
                    <span>{driver.phone}{driver.email ? ` • ${driver.email}` : ''}</span>
                    <span>
                      {driver.driverCompanies.length > 0
                        ? driver.driverCompanies.map(({ company }) => company.name).join(', ')
                        : 'Sem empresa vinculada'}
                    </span>
                  </div>
                  <div>
                    <div className="company-status">{driver.status === 'ACTIVE' ? 'ATIVO' : 'INATIVO'}</div>
                    <button className="new-company-button" onClick={() => editDriver(driver)}>
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    );
  }

// TELA DE IMPORTAÇÃO COM IA
if (showAiImport) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-logo">MIL</div>

          <div>
            <h1>Central de Operações</h1>
            <span>Importação Inteligente</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={() => setShowAiImport(false)}
        >
          ← Início
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-card">
          <div className="companies-title">
            <div>
              <span className="badge">MIL IA</span>
              <h2>Importação com IA</h2>
            </div>
          </div>

          <p>
            Cole abaixo os dados de empresas, beneficiários, pagamentos,
            celulares ou marketplaces.
          </p>

          <textarea
            rows={14}
            value={aiImportText}
            onChange={(e) => setAiImportText(e.target.value)}
            placeholder="Cole aqui os dados que deseja importar..."
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #d8e0ea',
              boxSizing: 'border-box',
              resize: 'vertical',
              fontSize: '15px',
            }}
          />

<div style={{ marginTop: '16px', marginBottom: '8px' }}>
  <input
    type="file"
    accept=".xlsx,.xls"
    onChange={(e) => {
      const file = e.target.files?.[0] || null;
      setAiImportFile(file);
    }}
  />

  {aiImportFile && (
    <div style={{ marginTop: '8px', fontSize: '14px' }}>
      📊 Planilha selecionada: <strong>{aiImportFile.name}</strong>
    </div>
  )}
</div>
          <button
            type="button"
            className="new-company-button"
            style={{ marginTop: '16px' }}
            onClick={analyzeAiImport}
            disabled={aiImportLoading}
          >
            {aiImportLoading ? 'Analisando...' : '✨ Analisar com IA'}
          </button>
          {aiImportError && (
  <div className="error-message" style={{ marginTop: '16px' }}>
    {aiImportError}
  </div>
)}

{aiImportPreview && (
  <div
    style={{
      marginTop: '20px',
      padding: '20px',
      border: '1px solid #d8e0ea',
      borderRadius: '12px',
      background: '#ffffff',
    }}
  >
   
<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '20px',
  }}
>
  <div>
    <div
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: '999px',
        background: '#e8f0ff',
        fontSize: '12px',
        fontWeight: 700,
        marginBottom: '10px',
      }}
    >
      ANÁLISE PRONTA
    </div>

    <h3 style={{ margin: 0 }}>Prévia da análise</h3>

    <p style={{ margin: '6px 0 0', color: '#667085' }}>
      Revise os dados antes de confirmar a importação.
    </p>
  </div>
</div>

{aiImportPreview.totalCompanies > 0 &&
  Array.isArray(aiImportPreview.companies) && (
    <div
      style={{
        marginBottom: '20px',
        padding: '16px',
        border: '1px solid #d8e0ea',
        borderRadius: '12px',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <strong>Empresas encontradas na planilha</strong>

        <span
          style={{
            fontWeight: 700,
            fontSize: '18px',
          }}
        >
          {aiImportPreview.totalCompanies}
        </span>
      </div>

      <div
        style={{
          maxHeight: '320px',
          overflowY: 'auto',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        {aiImportPreview.companies.map(
          (company: any, index: number) => (
            <div
              key={`${company.number}-${index}`}
              style={{
                padding: '10px 4px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {company.company || `Empresa ${index + 1}`}
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: '#667085',
                  marginTop: '4px',
                }}
              >
                Celular: {company.phone || 'Não informado'}
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: '#667085',
                  marginTop: '2px',
                }}
              >
                Marketplaces:{' '}
                {company.marketplaces?.length
                  ? company.marketplaces.join(', ')
                  : 'Nenhum identificado'}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )}

{aiImportPreview.totalCompanies > 0 &&
  Array.isArray(aiImportPreview.companies) && (
    <div
      style={{
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <button
        type="button"
        className="new-company-button"
        onClick={confirmAiCompanyImport}
      >
        Confirmar importação das {aiImportPreview.totalCompanies} empresas
      </button>
      <button
  type="button"
  className="new-company-button"
  onClick={confirmAiMarketplaceImport}
  style={{ marginLeft: '10px' }}
>
  Importar marketplaces da planilha
</button>

<button
  type="button"
  className="new-company-button"
  onClick={confirmAiPaymentImport}
  style={{ marginLeft: '10px' }}
>
  Importar pagamentos da planilha
</button>

    </div>
  )}

<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '14px',
  }}
>
  <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
    <strong>Empresa</strong>
    <div>{aiImportPreview.company || 'Não identificado'}</div>
  </div>

  <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
    <strong>Beneficiário</strong>
    <div>{aiImportPreview.beneficiary || 'Não identificado'}</div>
  </div>

  <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
    <strong>CNPJ/CPF da empresa</strong>
    <div>{aiImportPreview.document || 'Não identificado'}</div>
  </div>

  <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
    <strong>CPF/CNPJ do beneficiário</strong>
    <div>{aiImportPreview.beneficiaryDocument || 'Não identificado'}</div>
  </div>

  <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
    <strong>PIX</strong>
    <div>{aiImportPreview.pixKey || 'Não identificado'}</div>
  </div>

  <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
    <strong>Pagamento</strong>
    <div>{aiImportPreview.paymentAmount || 'Não identificado'}</div>
  </div>

  <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
    <strong>Marketplace</strong>
    <div>{aiImportPreview.marketplace || 'Não identificado'}</div>
  </div>

  <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
    <strong>Celular</strong>
    <div>{aiImportPreview.phone || 'Não identificado'}</div>
  </div>
</div>
  </div>
)}
        </section>
      </main>
    </div>

    
  );
}



// TELA DE PAGAMENTOS
if (showPayments) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-logo">MIL</div>

          <div>
            <h1>Central de Operações</h1>
            <span>Gestão de Pagamentos</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={() => setShowPayments(false)}
        >
          ← Início
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-card">
          <div className="companies-title">
            <div>
              <span className="badge">FINANCEIRO</span>
              <h2>Pagamentos</h2>
            </div>
          </div>

          <p>
            Gerencie beneficiários, pagamentos mensais e vencimentos.
          </p>

<button
  className="new-company-button"
  onClick={() => {
    setNewPaymentBeneficiaryError('');
    setShowNewPaymentBeneficiary(true);
  }}
>
  + Novo Beneficiário
</button>

{showNewPaymentBeneficiary && (
  <div className="welcome-card">
    <h3>Novo Beneficiário</h3>

    {newPaymentBeneficiaryError && (
      <div className="error-message">
        {newPaymentBeneficiaryError}
      </div>
    )}

    <div className="form-grid">
      <label>
        Nome
        <input
          value={newPaymentBeneficiaryName}
          onChange={(event) =>
            setNewPaymentBeneficiaryName(event.target.value)
          }
          placeholder="Nome do beneficiário"
        />
      </label>

      <label>
        CPF/CNPJ
        <input
          value={newPaymentBeneficiaryDocument}
          onChange={(event) =>
            setNewPaymentBeneficiaryDocument(event.target.value)
          }
          placeholder="CPF ou CNPJ"
        />
      </label>

      <label>
        Chave PIX
        <input
          value={newPaymentBeneficiaryPixKey}
          onChange={(event) =>
            setNewPaymentBeneficiaryPixKey(event.target.value)
          }
          placeholder="Chave PIX"
        />
      </label>

      <label>
        Banco
        <input
          value={newPaymentBeneficiaryBank}
          onChange={(event) =>
            setNewPaymentBeneficiaryBank(event.target.value)
          }
          placeholder="Nome do banco"
        />
      </label>

      <label>
        Agência
        <input
          value={newPaymentBeneficiaryAgency}
          onChange={(event) =>
            setNewPaymentBeneficiaryAgency(event.target.value)
          }
          placeholder="Agência"
        />
      </label>

      <label>
        Conta
        <input
          value={newPaymentBeneficiaryAccount}
          onChange={(event) =>
            setNewPaymentBeneficiaryAccount(event.target.value)
          }
          placeholder="Conta"
        />
      </label>
    </div>

    <div className="form-actions">
      <button
        className="new-company-button"
        onClick={createPaymentBeneficiary}
        disabled={newPaymentBeneficiaryLoading}
      >
        {newPaymentBeneficiaryLoading
          ? 'Salvando...'
          : 'Salvar Beneficiário'}
      </button>

      <button
        type="button"
        className="logout-button"
        onClick={() => {
          setShowNewPaymentBeneficiary(false);
          setNewPaymentBeneficiaryError('');
        }}
      >
        Cancelar
      </button>
    </div>
  </div>
)}

{paymentBeneficiariesLoading && (
  <p>Carregando beneficiários...</p>
)}

{paymentBeneficiariesError && (
  <div className="error-message">
    {paymentBeneficiariesError}
  </div>
)}

{!paymentBeneficiariesLoading &&
  !paymentBeneficiariesError &&
  paymentBeneficiaries.length === 0 && (
    <p>Nenhum beneficiário cadastrado.</p>
  )}

{paymentBeneficiaries.length > 0 && (
  <div>
    <h3>Beneficiários cadastrados</h3>

    {paymentBeneficiaries.map((beneficiary) => (
  <div key={beneficiary.id} className="payment-beneficiary-card">
    <strong>{beneficiary.name}</strong>

    <div>
      <span>CPF/CNPJ: {beneficiary.document || 'Não informado'}</span>
    </div>

    <div>
      <span>Chave PIX: {beneficiary.pixKey || 'Não informada'}</span>
    </div>

    <div>
      <span>Banco: {beneficiary.bankName || 'Não informado'}</span>
    </div>

    <div>
      <span>Agência: {beneficiary.agency || 'Não informada'}</span>
    </div>

   <div>
  <span>Conta: {beneficiary.account || 'Não informada'}</span>
</div>

<button
  type="button"
  className="payment-delete-button"
  onClick={() =>
    deletePaymentBeneficiary(
      beneficiary.id,
      beneficiary.name,
    )
  }
>
  Excluir
</button>
</div>

  
))}
  </div>
  
)}

{paymentsLoading && (
  <p>Carregando pagamentos...</p>
)}

{paymentsError && (
  <div className="error-message">
    {paymentsError}
  </div>
)}

{!paymentsLoading && !paymentsError && payments.length === 0 && (
  <p>Nenhum pagamento cadastrado.</p>
)}

{payments.length > 0 && (
  <div>
    <h3>Pagamentos cadastrados</h3>

    {payments.map((payment) => (
      <div
        key={payment.id}
        className="payment-beneficiary-card"
      >
        <strong>
          {payment.beneficiary?.name || 'Beneficiário não informado'}
        </strong>

        <div>
          Valor:{' '}
          {Number(payment.amount || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </div>

        <div>
          Categoria: {payment.category}
        </div>

        <div>
          Descrição: {payment.description || 'Não informada'}
        </div>

        <div>
          Vencimento: {payment.dueDay || 'A definir'}
        </div>

        <div>
          Referência: {payment.referenceMonth}/{payment.referenceYear}
        </div>

        <div>
          Status: {payment.status}
        </div>

<div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
  <button
    type="button"
    onClick={() => editPayment(payment)}
  >
    Editar
  </button>

  <button
    type="button"
    onClick={() => deletePayment(payment)}
  >
    Excluir
  </button>
</div>

      </div>
    ))}
  </div>
)}

        </section>
      </main>
    </div>
  );
}

  // TELA DE EMPRESAS
  if (showCompanies) {
    const companiesWithDevice = new Set(
  dashboardDevices.map((device) => device.companyId),
).size;

const companiesWithoutDevice = Math.max(
  companiesTotal - companiesWithDevice,
  0,
);

const pendingCompanies = dashboardCompanies.filter((company) => {
  const hasDevice = dashboardDevices.some(
    (device) => device.companyId === company.id,
  );

  const hasDocument = Boolean(company.document?.trim());
  const hasPhone = Boolean(company.phone?.trim());
  const hasEmail = Boolean(company.email?.trim());

  return !hasDevice || !hasDocument || !hasPhone || !hasEmail;
}).length;
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <div className="dashboard-logo">MIL</div>

            <div>
              <h1>Central de Operações</h1>
              <span>Gestão de Empresas</span>
            </div>
          </div>

<button
  type="button"
  className="logout-button"
  onClick={() => setShowCompanies(false)}
>
  ← Início
</button>

</header>
                 <button
  className="new-company-button"
                  onClick={() => {
                    setCompaniesSuccess('');
                    setShowNewCompany(true);
                  }}
>
  + Nova Empresa
</button>

<section className="device-metrics">
  <div>
    <strong>{companiesTotal}</strong>
    <span>Total de empresas</span>
  </div>

  <div>
    <strong>{companiesWithDevice}</strong>
    <span>Com aparelho</span>
  </div>

  <div>
    <strong>{companiesWithoutDevice}</strong>
    <span>Sem aparelho</span>
  </div>

  <div>
    <strong>{pendingCompanies}</strong>
    <span>Pendentes</span>
  </div>
</section>

{companiesLoading && (
  <section className="welcome-card">
    <p>Carregando empresas...</p>
  </section>
)}

{companiesError && (
  <section className="welcome-card">
    <div className="error-message">{companiesError}</div>
  </section>
)}

{!companiesLoading && !companiesError && companies.length === 0 && (
  <section className="welcome-card">
    <p>Nenhuma empresa cadastrada.</p>
  </section>
)}

{!companiesLoading && !companiesError && companies.length > 0 && (
  <section className="companies-list">
    {companies.map((company) => (
      <div className="company-row" key={company.id}>
        <div>
          <strong>{company.name}</strong>

          <div>
            {company.document || 'Documento não informado'}
          </div>

          <div>
            {company.phone || 'Telefone não informado'}
          </div>

          <div>
            {company.email || 'E-mail não informado'}
          </div>
        </div>

        <div>
          <div className="company-status">
            {company.status || 'ACTIVE'}
          </div>

          <button
            type="button"
            className="new-company-button"
            onClick={() => editCompany(company)}
          >
            Editar
          </button>
        </div>
      </div>
    ))}
  </section>
)}

<button
  type="button"
  disabled={companiesPage <= 1}
  onClick={() =>
    setCompaniesPage((page) => Math.max(1, page - 1))
  }
>
      Anterior
    </button>

    <span>
      Página {companiesPage} de {companiesTotalPages}
    </span>

    <button
      type="button"
      disabled={companiesPage >= companiesTotalPages}
      onClick={() =>
        setCompaniesPage((page) =>
          Math.min(companiesTotalPages, page + 1),
        )
      }
    >
      Próxima
    </button>
  </div>
  );
}
  

  // DASHBOARD
const totalCompanies = companiesTotal;
const activeCompanies = companies.filter(
  (company) => company.status === 'ACTIVE',
).length;

const totalDrivers = drivers.length;
const activeDrivers = drivers.filter(
  (driver) => driver.status === 'ACTIVE',
).length;
const totalDevices = devicesTotal;

const onlineDevices = dashboardDevices.filter(
  (device) => device.currentStatus?.isOnline === true,
).length;

const offlineDevices = totalDevices - onlineDevices;

const criticalBatteryDevices = dashboardDevices.filter((device) => {
  const battery = device.currentStatus?.batteryLevel;
  return battery !== null && battery !== undefined && battery >= 11 && battery <= 20;
}).length;

const emergencyBatteryDevices = dashboardDevices.filter((device) => {
  const battery = device.currentStatus?.batteryLevel;
  return battery !== null && battery !== undefined && battery <= 10;
}).length;

const devicesWithoutRecentLocation = dashboardDevices.filter((device) => {
  const lastLocationAt = device.currentStatus?.lastLocationAt;

  if (!lastLocationAt) return true;

  const lastLocationTime = new Date(lastLocationAt).getTime();
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

  return lastLocationTime < thirtyMinutesAgo;
}).length;

const unreadSms = smsMessages.filter(
  (sms) => !sms.readAt,
).length;

const marketplaceProblems = marketplaceAccounts.filter((account) =>
  ['DISCONNECTED', 'BLOCKED', 'ERROR'].includes(account.status),
).length;

const attentionItems = [
  ...dashboardDevices
    .filter((device) => device.currentStatus?.isOnline !== true)
    .map((device) => ({
      type: 'Aparelho offline',
      description: `${device.company?.name || 'Empresa'} - ${
        device.model || device.phoneNumber || 'Aparelho'
      }`,
      level: 'critical',
    })),

  ...dashboardDevices
    .filter((device) => {
      const battery = device.currentStatus?.batteryLevel;
      return battery !== null && battery !== undefined && battery <= 20;
    })
    .map((device) => ({
      type: 'Bateria crítica',
      description: `${device.company?.name || 'Empresa'} - ${
        device.currentStatus?.batteryLevel ?? 0
      }%`,
      level:
        (device.currentStatus?.batteryLevel ?? 0) <= 10
          ? 'emergency'
          : 'warning',
    })),

   ...smsMessages
    .filter((sms) => !sms.readAt)
    .slice(0, 5)
    .map((sms) => ({
      type: 'SMS não lido',
      description: `${sms.sender}: ${sms.message}`,
      level: 'info',
    })),

  ...marketplaceAccounts
    .filter((account) =>
      ['DISCONNECTED', 'BLOCKED', 'ERROR'].includes(account.status),
    )
    .map((account) => ({
      type: 'Marketplace com problema',
      description: `${
        account.company?.name || 'Empresa'
      } - ${account.marketplace?.name || 'Marketplace'} - ${account.status}`,
      level: 'critical',
    })),
];

const attentionTotal =
  offlineDevices +
  criticalBatteryDevices +
  emergencyBatteryDevices +
  unreadSms +
  marketplaceProblems;

return (
  <div className="dashboard-page">
    <header className="dashboard-header">
      <div className="dashboard-brand">
        <div className="dashboard-logo">MIL</div>

        <div>
          <h1>Central de Operações</h1>
          <span>Painel Administrativo</span>
        </div>
      </div>

      <div className="dashboard-header-actions">
        <div className="system-status">
          <span className="system-status-dot" />
          Sistema Online
        </div>

        <div className="dashboard-user">
          <strong>{currentUser?.role ?? 'USUÁRIO'}</strong>
          <span>{currentUser?.name ?? 'Usuário'}</span>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Sair
        </button>
      </div>
    </header>

    <main className="dashboard-content">
      {companiesSuccess && (
        <section className="welcome-card">
          <div className="success-message">
            {companiesSuccess}
          </div>
        </section>
      )}

      <section className="dashboard-title-section">
        <div>
          <span className="badge">VISÃO GERAL</span>
          <h2>Dashboard Operacional</h2>
          <p>
            Monitoramento centralizado de empresas, motoristas, aparelhos,
            SMS, localização e marketplaces.
          </p>
        </div>

        <button
          className="refresh-dashboard-button"
          onClick={() => window.location.reload()}
        >
          Atualizar Dashboard
        </button>
      </section>

      <section className="operational-cards-grid">
        <div className="operational-card">
          <span>Empresas</span>
          <strong>{totalCompanies}</strong>
          <small>{activeCompanies} ativas</small>
        </div>

        <div className="operational-card">
          <span>Motoristas</span>
          <strong>{totalDrivers}</strong>
          <small>{activeDrivers} ativos</small>
        </div>

        <div className="operational-card">
          <span>Aparelhos</span>
          <strong>{totalDevices}</strong>
          <small>Total monitorado</small>
        </div>

        <div className="operational-card success">
          <span>Online</span>
          <strong>{onlineDevices}</strong>
          <small>Aparelhos conectados</small>
        </div>

        <div className="operational-card danger">
          <span>Offline</span>
          <strong>{offlineDevices}</strong>
          <small>Aparelhos sem conexão</small>
        </div>

        <div className="operational-card warning">
          <span>Bateria crítica</span>
          <strong>{criticalBatteryDevices}</strong>
          <small>Entre 11% e 20%</small>
        </div>

        <div className="operational-card emergency">
          <span>Emergência</span>
          <strong>{emergencyBatteryDevices}</strong>
          <small>10% ou menos</small>
        </div>

        
        <div className="operational-card warning">
          <span>Sem localização recente</span>
          <strong>{devicesWithoutRecentLocation}</strong>
          <small>Mais de 30 minutos</small>
        </div>

        <div className="operational-card">
          <span>SMS não lidos</span>
          <strong>{unreadSms}</strong>
          <small>Mensagens pendentes</small>
        </div>

        <div className="operational-card danger">
          <span>Marketplaces com problema</span>
          <strong>{marketplaceProblems}</strong>
          <small>Bloqueados, desconectados ou erro</small>
        </div>
      </section>

      <section className="dashboard-panel attention-panel">
        <div className="dashboard-panel-header">
          <div>
            <span className="badge">ATENÇÃO</span>
            <h3>Central de Atenção</h3>
          </div>

          <strong>{attentionTotal}</strong>
        </div>

        {attentionItems.length === 0 ? (
          <div className="empty-state">
            Nenhum problema operacional identificado.
          </div>
        ) : (
          <div className="attention-list">
            {attentionItems.slice(0, 10).map((item, index) => (
              <div
                className={`attention-item ${item.level}`}
                key={`${item.type}-${index}`}
              >
                <strong>{item.type}</strong>
                <span>{item.description}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <span className="badge">APARELHOS</span>
            <h3>Status dos Aparelhos</h3>
          </div>

          <button
            className="secondary-button"
            onClick={() => setShowDevices(true)}
          >
            Ver todos
          </button>
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Aparelho</th>
                <th>Motorista</th>
                <th>Status</th>
                <th>Bateria</th>
                <th>Carregando</th>
                <th>Última comunicação</th>
              </tr>
            </thead>

            <tbody>
              {devices.slice(0, 8).map((device) => (
                <tr key={device.id}>
                  <td>{device.company?.name || '-'}</td>
                  <td>
                    {device.model ||
                      device.phoneNumber ||
                      device.imei ||
                      '-'}
                  </td>
                  <td>{device.driver?.fullName || '-'}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        device.currentStatus?.isOnline
                          ? 'active'
                          : 'offline'
                      }`}
                    >
                      {device.currentStatus?.isOnline
                        ? 'ONLINE'
                        : 'OFFLINE'}
                    </span>
                  </td>
                  <td>
                    {device.currentStatus?.batteryLevel ?? '-'}%
                  </td>
                  <td>
                    {device.currentStatus?.isCharging
                      ? 'Sim'
                      : 'Não'}
                  </td>
                  <td>
                    {device.currentStatus?.lastSeenAt
                      ? new Date(
                          device.currentStatus.lastSeenAt,
                        ).toLocaleString('pt-BR')
                      : '-'}
                  </td>
                </tr>
              ))}

              {devices.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    Nenhum aparelho cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-two-columns">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="badge">SMS</span>
              <h3>Últimos SMS</h3>
            </div>

            <button
              className="secondary-button"
              onClick={() => setShowSms(true)}
            >
              Ver Central
            </button>
          </div>

          <div className="recent-list">
            {smsMessages.slice(0, 5).map((sms) => (
              <div
                className="recent-item"
                key={sms.id}
              >
                <div>
                  <strong>{sms.sender}</strong>
                  <span>{sms.message}</span>
                </div>

                <div className="recent-item-meta">
                  <span>
                    {new Date(
                      sms.receivedAt,
                    ).toLocaleString('pt-BR')}
                  </span>

                  <span
                    className={`status-badge ${
                      sms.readAt ? 'active' : 'pending'
                    }`}
                  >
                    {sms.readAt ? 'LIDO' : 'NÃO LIDO'}
                  </span>
                </div>
              </div>
            ))}

            {smsMessages.length === 0 && (
              <div className="empty-state">
                Nenhum SMS recebido.
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="badge">MARKETPLACES</span>
              <h3>Status Operacional</h3>
            </div>

            <button
              className="secondary-button"
              onClick={() => setShowMarketplaces(true)}
            >
              Ver Marketplaces
            </button>
          </div>

          <div className="recent-list">
            {marketplaceAccounts.slice(0, 8).map((account) => (
              <div
                className="recent-item"
                key={account.id}
              >
                <div>
                  <strong>
                    {account.marketplace?.name ||
                      'Marketplace'}
                  </strong>
                  <span>
                    {account.company?.name || 'Empresa'}
                  </span>
                </div>

                <span
                  className={`status-badge ${account.status.toLowerCase()}`}
                >
                  {account.status}
                </span>
              </div>
            ))}

            {marketplaceAccounts.length === 0 && (
              <div className="empty-state">
                Nenhuma conta de marketplace vinculada.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="modules-grid">
        <button
          className="module-card"
          onClick={() => setShowCompanies(true)}
        >
          <strong>Empresas</strong>
          <span>Gerenciar empresas cadastradas</span>
        </button>

        <button
          className="module-card"
          onClick={() => setShowDrivers(true)}
        >
          <strong>Motoristas</strong>
          <span>Gerenciar agentes operacionais</span>
        </button>

        <button
          className="module-card"
          onClick={() => setShowDevices(true)}
        >
          <strong>Aparelhos</strong>
          <span>Monitorar celulares e conectividade</span>
        </button>

        <button
          className="module-card"
          onClick={() => setShowSms(true)}
        >
          <strong>SMS</strong>
          <span>Consultar mensagens dos aparelhos</span>
        </button>

        <button
          className="module-card"
          onClick={() => setShowMarketplaces(true)}
        >
          <strong>Marketplaces</strong>
          <span>Monitorar status das contas</span>
        </button>

<button
  className="module-card"
  onClick={() => setShowAiImport(true)}
>
  <strong>✨ Importação com IA</strong>
  <span>Colar dados para análise e cadastro inteligente</span>
</button>

        <button
  className="module-card"
  onClick={() => setShowPayments(true)}
>
  <strong>Pagamentos</strong>
  <span>Gerenciar beneficiários e pagamentos</span>
</button>

        <button
  className="module-card"
  onClick={() => setShowUsers(true)}
>
          <strong>Usuários</strong>
          <span>Gerenciar usuários e acessos</span>
        </button>

        <button
  className="module-card"
  onClick={() => setShowHolders(true)}
>
          <strong>Titulares</strong>
          <span>Consultar titulares cadastrados</span>
        </button>

        <button
  className="module-card"
  onClick={() => setShowPermissions(true)}
>
          <strong>Permissões</strong>
          <span>Controle de acesso do sistema</span>
        </button>
      </section>
    </main>
  </div>
);
}

export default App;