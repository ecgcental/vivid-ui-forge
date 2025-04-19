import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { LoadMonitoringData } from '@/lib/asset-types';
import { AccessControlWrapper } from '@/components/access-control/AccessControlWrapper';
import { Button, Table, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const LoadMonitoringPage: React.FC = () => {
  const { 
    loadMonitoringRecords, 
    saveLoadMonitoringRecord, 
    updateLoadMonitoringRecord, 
    deleteLoadMonitoringRecord,
    regions,
    districts,
    user,
    canEditLoadMonitoring,
    canDeleteLoadMonitoring
  } = useData();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LoadMonitoringData | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: LoadMonitoringData) => {
    if (!canEditLoadMonitoring(record)) {
      message.error('You do not have permission to edit this record');
      return;
    }
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      date: moment(record.date)
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record: LoadMonitoringData) => {
    if (!canDeleteLoadMonitoring(record)) {
      message.error('You do not have permission to delete this record');
      return;
    }
    Modal.confirm({
      title: 'Are you sure you want to delete this record?',
      content: 'This action cannot be undone.',
      onOk: () => {
        deleteLoadMonitoringRecord(record.id);
        message.success('Record deleted successfully');
      }
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const data = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        id: editingRecord?.id || Date.now().toString()
      };

      if (editingRecord) {
        updateLoadMonitoringRecord(editingRecord.id, data);
        message.success('Record updated successfully');
      } else {
        saveLoadMonitoringRecord(data);
        message.success('Record added successfully');
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'Region',
      dataIndex: 'regionId',
      key: 'regionId',
      render: (regionId: string) => regions.find(r => r.id === regionId)?.name
    },
    {
      title: 'District',
      dataIndex: 'districtId',
      key: 'districtId',
      render: (districtId: string) => districts.find(d => d.id === districtId)?.name
    },
    {
      title: 'Peak Load (MW)',
      dataIndex: 'peakLoad',
      key: 'peakLoad'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LoadMonitoringData) => (
        <span>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!canEditLoadMonitoring(record)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={!canDeleteLoadMonitoring(record)}
          />
        </span>
      )
    }
  ];

  return (
    <AccessControlWrapper type="load-monitoring">
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Button type="primary" onClick={handleAdd}>
            Add Load Monitoring Record
          </Button>
        </div>

        <Table
          dataSource={loadMonitoringRecords}
          columns={columns}
          rowKey="id"
        />

        <Modal
          title={editingRecord ? 'Edit Load Monitoring Record' : 'Add Load Monitoring Record'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="regionId"
              label="Region"
              rules={[{ required: true, message: 'Please select a region' }]}
            >
              <Select>
                {regions.map(region => (
                  <Option key={region.id} value={region.id}>{region.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="districtId"
              label="District"
              rules={[{ required: true, message: 'Please select a district' }]}
            >
              <Select>
                {districts.map(district => (
                  <Option key={district.id} value={district.id}>{district.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="peakLoad"
              label="Peak Load (MW)"
              rules={[{ required: true, message: 'Please input the peak load' }]}
            >
              <Input type="number" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AccessControlWrapper>
  );
};

export default LoadMonitoringPage; 