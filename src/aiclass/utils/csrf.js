// utils/csrf.js
/**
 * 从Cookie中获取CSRF令牌
 * @param {string} name - Cookie名称
 * @returns {string|null} CSRF令牌或null
 */
export function getCSRFToken(name = 'csrftoken') {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // 检查cookie是否以名称开头
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  
  /**
   * 确保CSRF令牌已获取，如果没有则尝试从隐藏输入获取
   */
  export function ensureCSRFToken() {
    let csrfToken = getCSRFToken();
    
    // 如果Cookie中没有，尝试从隐藏输入获取（如果页面上有）
    if (!csrfToken) {
      const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
      if (csrfInput) {
        csrfToken = csrfInput.value;
      }
    }
    
    return csrfToken;
  }