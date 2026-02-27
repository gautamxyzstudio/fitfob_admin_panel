/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TableProps } from "@mui/material";
import type { GridColDef, GridRenderCellParams, GridRowsProp } from "@mui/x-data-grid";
import type React from "react";
import type { IEmptyScreenViewProps } from "../emptyScreenView/EmptyScreenView.types";

export interface ICustomDataTableProps extends TableProps, IEmptyScreenViewProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  isLoading: boolean;
  headerView?: React.ReactNode;
  tableHeight?: number;
  paginationControls?: React.ReactNode;
  onPressPageChange?: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => void;
  footerComponent?:
    | React.ComponentType<{
        context?: any;
      }>
    | undefined;
  withPagination: boolean;
  page?: number;
  totalCount?: number;
  customStyles?: string;
  onRowClick?: (params: GridRenderCellParams<any, any, any>) => void;

}
