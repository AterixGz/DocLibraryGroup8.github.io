import SliderComponent from "../SliderComponent/SliderComponent";
import Image1 from '../ReportsImage/LaptopBG.jpg';
import Image2 from '../ReportsImage/Postit.jpg';
import Image3 from '../ReportsImage/SolarCell.jpg';

const slides = [
  {
    image: Image1,
    subtitle: 'สถิติ',
    title: 'ข้อมูลทั่วไป',
    description: 'ข้อมูลสถิติการดาวน์โหลดไฟล์',
    stats: [
      { value: '12,304', label: 'ยอดดาวน์โหลด', unit: 'ครั้ง' },
      { value: '1,589', label: 'ยอดเอกสารทั้งหมด', unit: 'ครั้ง' },
      { value: '104,204', label: 'ยอดเข้าชมเว็บไซต์', unit: 'ครั้ง' },
    ],
    date: '19/10/2567 เวลา 19:XX น.',
  },
  {
    image: Image2,
    subtitle: 'สถิติ',
    title: 'เอกสารแต่ละปี',
    description: 'ข้อมูลเอกสารแยกตามปี',
    stats: [
      { value: '359', label: 'เอกสารปี 2567', unit: 'ฉบับ' },
      { value: '250', label: 'เอกสารปี 2566', unit: 'ฉบับ' },
      { value: '159', label: 'เอกสารปี 2565', unit: 'ฉบับ' },
    ],
    date: '19/10/2567 เวลา 19:XX น.',
  },
  {
    image: Image3,
    subtitle: 'สถิติ',
    title: 'เอกสารในปีนี้',
    description: 'ข้อมูลเอกสารประจำเดือนและปี',
    stats: [
      { value: '12', label: 'เอกสารในสัปดาห์นี้', unit: 'ฉบับ' },
      { value: '359', label: 'ยอดเอกสารในปีนี้', unit: 'ฉบับ' },
      { value: '50', label: 'เอกสารในเดือนนี้', unit: 'ฉบับ' },
    ],
    date: '19/10/2567 เวลา 19:XX น.',
  },
];
function addFile() {
    return (
        <>
        <SliderComponent slides={slides} />
            <h1>awdawdaTest</h1>
        </>
    );
}

export default addFile;