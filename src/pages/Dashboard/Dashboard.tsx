import React, { useState, useEffect } from 'react';
import CardDataStats from '../../components/CardDataStats';
import DefaultLayout from '../../layout/DefaultLayout';
import { Hotel, SquareUserRound } from 'lucide-react';
import { getTheStaff, listTheStaffs } from '../../graphql/queries';

import { generateClient } from 'aws-amplify/api';
import Logo from '../../images/logo/logo.png';
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks from react-router-dom
import { uploadData, getUrl, list, remove } from 'aws-amplify/storage';

const ECommerce: React.FC = () => {
  const { id } = useParams(); // Get the staff ID from the URL, if it exists
  console.log('ids', id);
  const navigation = useNavigate();
  const API = generateClient();

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phoneNumber: '',
    status: '',
  });
  useEffect(() => {
    if (id) {
      const fetchStaffData = async () => {
        try {
          console.log('Fetching staff with ID:', id); // Debug log
          const staffData = await API.graphql({
            query: getTheStaff, // Replace with your actual query to get staff by ID
            variables: { id },
          });

          const staff = staffData.data.getTheStaff;
          console.log('staff...s', staff);
          const status =
            staff.profileStatus === 'Incomplete'
              ? 'Pending'
              : staff.profileStatus;

          setFormData({
            name: staff.name,
            email: staff.email,
            phoneNumber: staff.phoneNumber,
            status: status,
            employeeId: staff.employeeid,
          });
        } catch (error) {
          console.error('Error fetching staff data:', error);
        }
      };

      fetchStaffData();
    }
  }, [id]);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [prevFileUri, setPrevFileUri] = useState<string | null>(null);

  const downloadFromS3 = async ({
    folder,
    subFolder,
    fullPath,
    setFileUrl,
  }: {
    folder?: string;
    subFolder?: string;
    fullPath?: string;
    setFileUrl: (url: string) => void;
  }) => {
    try {
      if (fullPath) {
        const url = (await getUrl({ path: fullPath })).url;
        setFileUrl(`${url}`);
      } else {
        const folderPath = `public/User/${folder}/${id}/${
          subFolder ? `${subFolder}/` : ''
        }`;
        const filePath = (await list({ path: folderPath })).items[0]?.path;
        const url = (await getUrl({ path: filePath })).url;
        setFileUrl(`${url}`);
      }
    } catch (Error) {
      console.log('Error downloading from S3 ', Error);
    }
  };
  useEffect(() => {
    const downloadFile = async () => {
      await downloadFromS3({
        folder: 'userprofile',
        subFolder: 'selfie',
        setFileUrl: (url) => {
          setFileUri(url);
          setPrevFileUri(url);
          console.log('url', url);
        },
      });
      //setIsLoading(false);
    };
    downloadFile();
  }, []);
  return (
    <>
      <>
        <div className="mx-auto mt-4 max-w-md sm:max-w-lg lg:max-w-xl rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
          <div className="flex justify-center m-6">
            {/* <p className="text-xl font-bold text-black dark:text-white">Bio-logic</p> */}
            <img src={Logo} alt="Logo" width={60} />
          </div>
          <div className="flex flex-col items-center p-6 sm:p-8">
            <div className="mb-4 flex-shrink-0">
              <img
                src={fileUri}
                alt="profile"
                width={130}
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: 65, // Half of the width and height to make it a circle
                }}
              />
              <h3 className="text-center mt-3 mb-2 text-2xl font-semibold text-black dark:text-white">
                {/* {formData.name} */}
              </h3>
            </div>

            <div className="w-full">
              <div className="flex flex-row items-center sm:items-start p-3">
                <h4 className="font-semibold text-black dark:text-white">
                  Employee ID
                </h4>
                <span className="font-regular text-black dark:text-gray-400 sm:ml-4">
                  {'formData.employeeId'}
                </span>
              </div>
              <div className="flex flex-row items-center sm:items-start p-3">
                <h4 className="font-semibold text-black dark:text-white">
                  Email
                </h4>
                <span className="font-regular text-black dark:text-gray-400 sm:ml-4">
                  {'formData.email'}
                </span>
              </div>
              <div className="flex flex-col items-center sm:items-start p-3">
                <h4 className="font-semibold text-black dark:text-white">
                  Phone Number
                </h4>
                <span className="font-regular text-black dark:text-gray-400 sm:ml-4">
                  {formData.phoneNumber}
                </span>
              </div>
              <div className="flex flex-col items-center sm:items-start p-3">
                <h4 className="font-semibold text-black dark:text-white">
                  DOB
                </h4>
                <span className="font-regular text-black dark:text-gray-400 sm:ml-4">
                  {' '}
                  {formData.dob}
                </span>
              </div>
              <div className="flex flex-col items-center sm:items-start p-3">
                <h4 className="font-semibold text-black dark:text-white">
                  Profile Status
                </h4>
                <span className="font-regular text-black dark:text-gray-400 sm:ml-4">
                  {' '}
                  {formData.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default ECommerce;
