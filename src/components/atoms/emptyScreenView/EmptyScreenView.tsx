import type { IEmptyScreenViewProps } from './EmptyScreenView.types';

const EmptyScreenView: React.FC<IEmptyScreenViewProps> = ({
  isDataEmpty,
  error,
  emptyViewSubTitle,
  emptyViewTitle,
}) => {
  return (
    <div>
      {isDataEmpty && !error && (
        <div className="flex flex-col justify-center items-center p-6">
          {/* <Image
            className={illustrationStyes + ' w-[297px] h-[187px]'}
            alt="noSubAdmin"
            src={illustration ?? Images.errorILLustration}
          /> */}
          <h1 className="mt-6 text-black text-xl font-bold ">
            {emptyViewTitle}
          </h1>
          <h2 className="mt-2 text-sm text-black">{emptyViewSubTitle}</h2>
        </div>
      )}
      {error && (
        <div className="flex flex-col justify-center items-center p-6">
          {/* <Image
            className={illustrationStyes + ' w-[297px] h-[187px]'}
            alt="noSubAdmin"
            src={Images.errorILLustration}
          /> */}
          <h1 className="mt-6 text-black text-xl font-bold ">
            {'Something went wrong'}
          </h1>
          <h2 className="mt-2 text-sm text-black">{error.message}</h2>
        </div>
      )}
    </div>
  );
};

export default EmptyScreenView;
