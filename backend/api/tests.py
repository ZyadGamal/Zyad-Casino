from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
import json

class AuthTests(APITestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'password': 'testpass123',
            'email': 'test@example.com'
        }
        self.user = User.objects.create_user(**self.user_data)
        
    def test_register(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'password': 'newpass123',
            'email': 'new@example.com'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('access' in response.data)
        
    def test_login(self):
        url = reverse('login')
        data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        
    def test_user_info(self):
        url = reverse('login')
        data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(url, data, format='json')
        token = login_response.data['access']
        
        url = reverse('user')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user_data['username'])