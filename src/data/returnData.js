export const returnHeaders = [
  {
    label: 'No',
    value: 'id',
  },
  {
    label: 'Asset Code',
    value: 'asset.code',
  },
  {
    label: 'Asset Name',
    value: 'asset.name',
  },
  {
    label: 'Requested by',
    value: 'requestBy.username',
  },
  {
    label: 'Assigned Date',
    value: 'assignedDate',
  },
  {
    label: 'Accepted by',
    value: 'acceptedBy.username',
  },
  {
    label: 'Returned Date',
    value: 'returnedDate',
  },
  {
    label: 'State',
    value: 'state',
  },
];

export const list = [
  {
    code: 'SD0001',
    name: 'Laptop 1',
    requestedBy: 'annt',
    assignedDate: '2021-08-05T13:26:53.085Z',
    acceptedBy: 'annt',
    returnedDate: '2021-08-05T13:26:53.085Z',
    state: true,
  },
  {
    code: 'SD0001',
    name: 'Laptop 1',
    requestedBy: 'annt',
    assignedDate: '2021-08-05T13:26:53.085Z',
    acceptedBy: 'annt',
    returnedDate: '2021-08-05T13:26:53.085Z',
    state: false,
  },
  {
    code: 'SD0001',
    name: 'Laptop 1',
    requestedBy: 'annt',
    assignedDate: '2021-08-05T13:26:53.085Z',
    acceptedBy: 'annt',
    returnedDate: '2021-08-05T13:26:53.085Z',
    state: false,
  },
];

export const states = [
  {
    id: 0,
    name: 'All',
    value: 'All',
  },
  {
    id: 1,
    name: 'Completed',
    value: true,
  },
  {
    id: 2,
    name: 'Waiting for returning',
    value: false,
  },
];
