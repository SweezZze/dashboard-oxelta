'use client'

import { useState } from 'react'

interface PubData {
  dateDebut: string
  dateFin: string
  imageUrl: string
  typeBg: boolean
  commentaire: string
  payed: boolean
  prix: number
}

export default function PubPage() {
  const [pubData, setPubData] = useState<PubData>({
    dateDebut: '',
    dateFin: '',
    imageUrl: '',
    typeBg: false,
    commentaire: '',
    payed: false,
    prix: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // TODO: Implémenter la connexion avec la base de données
      console.log('Données à envoyer:', pubData)
      // Exemple de requête à implémenter plus tard:
      // const response = await fetch('/api/pubs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(pubData)
      // })
      alert('Publicité ajoutée avec succès!')
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la publicité:', error)
      alert('Erreur lors de l\'ajout de la publicité')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'dateFin' && pubData.dateDebut) {
      // Vérifie que la date de fin n'est pas antérieure à la date de début
      if (new Date(value) < new Date(pubData.dateDebut)) {
        alert('La date de fin ne peut pas être antérieure à la date de début')
        return
      }
    }

    if (name === 'dateDebut' && pubData.dateFin) {
      // Vérifie que la date de début n'est pas postérieure à la date de fin
      if (new Date(value) > new Date(pubData.dateFin)) {
        setPubData(prev => ({
          ...prev,
          dateFin: '' // Reset la date de fin si la date de début est postérieure
        }))
      }
    }

    setPubData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) : value
    }))
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto">
      <div className="max-w-3xl mx-auto bg-background rounded-2xl shadow-xl p-8 mb-8">
        <h1 className="text-3xl font-extrabold text-foreground text-center mb-8">
          Ajouter une publicité
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="dateDebut" className="block text-sm font-medium text-foreground">
                Date de début
              </label>
              <input
                id="dateDebut"
                type="date"
                name="dateDebut"
                value={pubData.dateDebut}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dateFin" className="block text-sm font-medium text-foreground">
                Date de fin
              </label>
              <input
                id="dateFin"
                type="date"
                name="dateFin"
                value={pubData.dateFin}
                onChange={handleChange}
                min={pubData.dateDebut} // Empêche de sélectionner une date antérieure à la date de début
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground">
              URL de l'image
            </label>
            <input
              id="imageUrl"
              type="url"
              name="imageUrl"
              value={pubData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground transition-colors"
              required
              placeholder="https://exemple.com/image.jpg"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="typeBg"
                checked={pubData.typeBg}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
              />
              <span>Type Background</span>
            </label>

            <label className="flex items-center space-x-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="payed"
                checked={pubData.payed}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
              />
              <span>Payé</span>
            </label>
          </div>

          <div className="space-y-2">
            <label htmlFor="commentaire" className="block text-sm font-medium text-foreground">
              Commentaire
            </label>
            <textarea
              id="commentaire"
              name="commentaire"
              value={pubData.commentaire}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground transition-colors"
              rows={4}
              placeholder="Ajoutez vos commentaires ici..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prix" className="block text-sm font-medium text-foreground">
              Prix (€)
            </label>
            <input
              id="prix"
              type="number"
              name="prix"
              value={pubData.prix}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground transition-colors"
              min="0"
              step="0.01"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Publier l'annonce
          </button>
        </form>
      </div>
    </div>
  )
}
