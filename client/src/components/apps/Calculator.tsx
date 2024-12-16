import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Calculator() {
  const [display, setDisplay] = useState('0')
  const [operation, setOperation] = useState<string | null>(null)
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [newNumber, setNewNumber] = useState(true)

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num)
      setNewNumber(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const handleOperation = (op: string) => {
    setOperation(op)
    setPrevValue(parseFloat(display))
    setNewNumber(true)
  }

  const calculate = () => {
    if (operation && prevValue !== null) {
      const current = parseFloat(display)
      let result = 0
      switch (operation) {
        case '+': result = prevValue + current; break
        case '-': result = prevValue - current; break
        case '*': result = prevValue * current; break
        case '/': result = prevValue / current; break
      }
      setDisplay(result.toString())
      setOperation(null)
      setPrevValue(null)
      setNewNumber(true)
    }
  }

  const clear = () => {
    setDisplay('0')
    setOperation(null)
    setPrevValue(null)
    setNewNumber(true)
  }

  return (
    <div className="h-full grid grid-cols-4 gap-2">
      <div className="col-span-4 bg-muted p-4 rounded mb-2 text-right text-2xl">
        {display}
      </div>
      <Button variant="outline" onClick={() => clear()}>C</Button>
      <Button variant="outline" onClick={() => handleOperation('/')}>/</Button>
      <Button variant="outline" onClick={() => handleOperation('*')}>×</Button>
      <Button variant="outline" onClick={() => handleOperation('-')}>-</Button>
      
      <Button variant="secondary" onClick={() => handleNumber('7')}>7</Button>
      <Button variant="secondary" onClick={() => handleNumber('8')}>8</Button>
      <Button variant="secondary" onClick={() => handleNumber('9')}>9</Button>
      <Button variant="outline" onClick={() => handleOperation('+')}>+</Button>
      
      <Button variant="secondary" onClick={() => handleNumber('4')}>4</Button>
      <Button variant="secondary" onClick={() => handleNumber('5')}>5</Button>
      <Button variant="secondary" onClick={() => handleNumber('6')}>6</Button>
      <Button variant="primary" onClick={() => calculate()} className="row-span-3">=</Button>
      
      <Button variant="secondary" onClick={() => handleNumber('1')}>1</Button>
      <Button variant="secondary" onClick={() => handleNumber('2')}>2</Button>
      <Button variant="secondary" onClick={() => handleNumber('3')}>3</Button>
      
      <Button variant="secondary" onClick={() => handleNumber('0')} className="col-span-2">0</Button>
      <Button variant="secondary" onClick={() => handleNumber('.')}>.</Button>
    </div>
  )
}
