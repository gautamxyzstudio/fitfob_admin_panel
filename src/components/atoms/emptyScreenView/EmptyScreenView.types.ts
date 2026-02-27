export interface ICustomErrorResponse {
  message: string;
  statusCode: number | string;
}

export interface IEmptyScreenViewProps {
  emptyViewTitle?: string;
  emptyViewSubTitle?: string;

  illustrationStyes?: string;
  retryHandler?: () => void;
  error?: ICustomErrorResponse | undefined;
  isDataEmpty?: boolean;
}
