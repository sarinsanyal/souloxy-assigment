// tests/full.test.js
import { test } from 'node:test';
import assert from 'assert';
import request from 'supertest';
import app from '../app.js';
import prisma from '../lib/prisma.js';

let patientToken = '';
let therapistToken = '';
let patientId = null;
let therapistId = null;
let messageId = null;


test('Register Therapist', async () => {
  const res = await request(app).post('/api/register').send({
    name: 'Therapist One',
    email: 'therapist@example.com',
    password: 'therapistpass',
    role: 'THERAPIST'
  });

  assert.strictEqual([201, 409].includes(res.statusCode), true);
});


test('Register Patient', async () => {
  const res = await request(app).post('/api/register').send({
    name: 'Patient One',
    email: 'patient@example.com',
    password: 'patientpass',
    role: 'PATIENT'
  });

  assert.strictEqual([201, 409].includes(res.statusCode), true);
});


test('Login Therapist', async () => {
  const res = await request(app).post('/api/login').send({
    email: 'therapist@example.com',
    password: 'therapistpass',
  });

  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.token);
  therapistToken = res.body.token;
  therapistId = res.body.user.id;
});

test('Login Patient', async () => {
  const res = await request(app).post('/api/login').send({
    email: 'patient@example.com',
    password: 'patientpass',
  });

  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.token);
  patientToken = res.body.token;
  patientId = res.body.user.id;
});

test('Assign Therapist to Patient (via Prisma)', async () => {
  assert.ok(patientId);
  assert.ok(therapistId);

  const updated = await prisma.user.update({
    where: { id: patientId },
    data: { assignedTherapistId: therapistId },
  });

  assert.strictEqual(updated.assignedTherapistId, therapistId);
});

test('Send Message', async () => {
  const res = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({
      content: 'Hello Therapist!',
      type: 'TEXT',
      receiverId: therapistId,
    });

  assert.strictEqual(res.statusCode, 201);
  assert.ok(res.body.id);
  messageId = res.body.id;
});


test('Fetch Messages', async () => {
  const res = await request(app)
    .get(`/api/messages/${therapistId}`)
    .set('Authorization', `Bearer ${patientToken}`);

  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.some(msg => msg.id === messageId));
});
